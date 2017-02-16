from multiprocessing import Process, Value, Lock
import numpy as np
import csv, sys
import os
import h5py
import abc
import random
import json
from img2d import Img2DSerDe
from input import Input, BasicColumn, ColumnSerDe


class Dataset(object):
    DATA_DIR = "data"
    SCHEMA_NAME = "schema.json"

    def __init__(self, workspace, path):
        self.workspace = workspace
        self.metadata = self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Dataset from Path" + path

    def get_batch(self, batch_size):
        return Data()

    def load(self, path):
        self._validate(path)

        pass

    def _validate(self, path):
        pass

    class Builder(object):
        def __init__(self, input, name, root_dir, parallelism_level=2, storage_type="HDF5"):
            if not isinstance(input, Input):
                raise TypeError("Must be set to an Input")
            self._input = input
            self._name = name
            self._root_dir = root_dir
            self._parallelism_level = parallelism_level
            self._storage_type = storage_type
            self._init(root_dir)

        def _init(self, root_dir):
            self._dataset_root_dir = os.path.join(root_dir, self._name + "-" + random.getrandbits(64))
            self._dataset_data_dir = os.path.join(self._dataset_root_dir, Dataset.DATA_DIR)
            os.makedirs(self._dataset_root_dir)

        def build(self):
            class Progress(object):
                def __init__(self):
                    self.val = Value('i', 0)
                    self.lock = Lock()

                def increment(self):
                    with self.lock:
                        self.val.value += 1

                def value(self):
                    with self.lock:
                        return self.val.value

            self._create_data_schema()
            csv_rows_chunks = np.array_split(self._process_csv_file(), self._parallelism_level)
            processes = []
            progress = Progress()
            for i in range(self._parallelism_level):
                record_write = RecordWriter.factory(self._storage_type, self._dataset_data_dir, self._input.schema.columns)
                p = Process(target=Dataset.Builder.run, args=(csv_rows_chunks[i], record_write, progress))
                processes.append(p)
            for p in processes: p.start()
            for p in processes: p.join()

            print "Records processed: " + str(progress.value())

            return Dataset("", "path")

        def _process_csv_file(self):
            rows = []
            csv_file_path = self._input.schema.csv_file_path
            columns = self._input.schema.columns
            with open(csv_file_path, 'rb') as f:
                reader = csv.reader(f)
                try:
                    for row in reader:
                        rows.append(row)
                        for column in columns:
                            if column.data_type == BasicColumn.Type.CATEGORICAL:
                                column.metadata.add(row[column.columns_indexes[0]])
                except csv.Error as e:
                    sys.exit('Broken line: file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

            return rows

        def _create_data_schema(self):
            data_schema = {}
            for column in self._input.schema.columns:
                data_schema['name'] = column.name
                data_schema['type'] = column.data_type
                if column.data_type == BasicColumn.Type.CATEGORICAL:
                    data_schema['categories'] = list(column.metadata)
            with open(os.path.join(self._dataset_data_dir, Dataset.SCHEMA_NAME), 'w') as f:
                f.write(json.dumps(data_schema))

        @staticmethod
        def run(csv_rows, record_write, progress):
            for idx, row in enumerate(csv_rows):
                record_write.write(row, idx)
                progress.increment()


class RecordWriter(object):
    def __init__(self, data_dir, columns):
        self._data_dir = data_dir
        self._columns = columns

    def factory(type, data_dir, columns):
        if type == "HDF5":
            return HDF5RecordWriter(data_dir, columns)
        raise TypeError("Unsupported Record Writer Type: " + type)

    factory = staticmethod(factory)

    def write(self, csv_row, idx):
        pass


class RecordReader(object):
    def __init__(self, data_dir, columns):
        self._data_dir = data_dir
        self._columns = columns

    def factory(type, data_dir, columns):
        if type == "HDF5":
            return HDF5RecordWriter(data_dir, columns)
        raise TypeError("Unsupported Record Writer Type: " + type)

    factory = staticmethod(factory)

    def write(self, csv_row, idx):
        pass


class HDF5RecordWriter(RecordWriter):
    def __init__(self, data_dir, columns):
        super(HDF5RecordWriter, self).__init__(data_dir, columns)
        import multiprocessing as mp
        self._file = h5py.File(os.path.join(data_dir, "part-" + str(mp.current_process().pid)), 'w')
        self._root_data = self._file.create_group('data')
        self._init_serializers()

    def _init_serializers(self):
        self._serializers = {}
        basic = HDF5BasicColumnSerDe()
        for type in BasicColumn.type():
            self._serializers[type] = basic
        self._serializers[Img2DColumn.type()] = Img2DSerDe()

    def write(self, csv_row, idx):
        row_data = self._root_data.create_group('row_%08d' % idx)
        for column in self._columns:
            serializer = self._serializers[column.data_type]
            self._save(row_data, column.name, serializer.serialize(csv_row, column))

    @staticmethod
    def _save(data, path, value):
        if isinstance(value, dict):
            sub_path = data.create_group(path)
            for key in value:
                sub_path[key] = value[key]
        else:
            data[path] = value


class HDF5BasicColumnSerDe(ColumnSerDe):
    def __init__(self):
        pass

    def serialize(self, csv_row, column):
        if column.data_type == BasicColumn.Type.STRING:
            return str(csv_row[column.columns_indexes[0]])
        if column.data_type == BasicColumn.Type.INT:
            return int(csv_row[column.columns_indexes[0]])
        if column.data_type == BasicColumn.Type.FLOAT:
            return float(csv_row[column.columns_indexes[0]])
        if column.data_type == BasicColumn.Type.VECTOR:
            return np.array([float(csv_row[i]) for i in column.columns_indexes])
        if column.data_type == BasicColumn.Type.CATEGORICAL:
            cat_val = csv_row[column.columns_indexes[0]]
            cat_val_idx = list(column.metadata).index(cat_val)
            return int(cat_val_idx)

    @abc.abstractmethod
    def deserialize(self, path):
        return


class Data(object):
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"

    def to_data_frame(self):
        raise NotImplementedError("Please Implement this method")

    def for_column(self, column_name):
        return np.array([[7, 8, 5], [3, 5, 7]], np.int32)


class Metadata(object):
    def __init__(self):
        print ""


class Image2DMetadata(Metadata):
    def __init__(self):
        super(Image2DMetadata, self).__init__()
        print ""


class DataType:
    Image2D, Image3D, Text = range(3)


if __name__ == '__main__':
    from img2d import Img2DColumn, Img2DReader, ImgResizeTransform
    from input import Schema, Input, BasicColumn, BasicColumnSerDe, ColumnSerDe, ColumnSerDe
    import os
    import glob
    #
    pathCSV = '../../../../data-test/dataset-image2d/simple4c_test/test-csv-v1.csv'
    if not os.path.isfile(pathCSV):
        raise Exception('Cant find file [%s]' % pathCSV)
    wdir = os.path.abspath(os.path.dirname(pathCSV))
    schema = Schema(pathCSV, header=True, separator='|')
    schema.print_data()
    input   = Input(schema=schema)
    # dataset = Dataset()
    print ('----')