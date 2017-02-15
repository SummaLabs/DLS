from multiprocessing import Process, Value, Lock
import numpy as np
import csv, sys
import os
import h5py
import abc
from img2d import Img2DSerDe
from input import Input, BasicColumn, ColumnSerDe


class Dataset(object):
    def __init__(self, workspace, path):
        self.workspace = workspace
        self.metadata = self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Dataset from Path" + path

    def get_batch(self, batch_size):
        return Data()

    class Builder(object):
        def __init__(self, input, parallelism_level=2):
            if not isinstance(input, Input):
                raise TypeError("Must be set to an Input")
            self._input = input
            self._parallelism_level = parallelism_level

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

            csv_rows_chunks = np.array_split(self._process_csv_file(), self._parallelism_level)
            processes = []
            progress = Progress()
            for i in range(self._parallelism_level):
                record_write = RecordWriter.factory("HDF5", "name", "id", "folder", self._input.schema.columns)
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

        @staticmethod
        def run(csv_rows, record_write, progress):
            for idx, row in enumerate(csv_rows):
                record_write.write(row, idx)
                progress.increment()


class RecordWriter(object):
    def __init__(self, name, id, dataset_folder, columns):
        self._name = name
        self._id = id
        self._dataset_folder = dataset_folder
        self._columns = columns

    def factory(type, name, id, dataset_folder, columns):
        if type == "HDF5":
            return HDF5RecordWriter(name, id, dataset_folder, columns)

        raise TypeError("Unsupported Record Writer Type: " + type)

    factory = staticmethod(factory)

    def write(self, csv_row, idx):
        pass


class HDF5RecordWriter(RecordWriter):
    def __init__(self, name, id, dataset_folder, columns):
        super(HDF5RecordWriter, self).__init__(name, id, dataset_folder, columns)
        self._file = h5py.File(os.path.join(dataset_folder, name + "-" + id), 'w')
        self._root_data = self._file.create_group('data')

    def write(self, csv_row, idx):
        row_data = self._root_data.create_group('row_%08d' % idx)
        for column in self._columns:
            serializer = self.get_column_serializer(column.data_type)
            serializer.serialize(csv_row, column)
            print ""

    def get_column_serializer(self, column_type):
        if type in BasicColumn.type():
            return HDF5BasicColumnSerDe()
        elif type == Img2DColumn.type():
            return Img2DSerDe()
        raise TypeError("Unsupported SerDe Type: " + column_type)


class HDF5BasicColumnSerDe(ColumnSerDe):
    def __init__(self):
        super(ColumnSerDe, self).__init__()

    @abc.abstractmethod
    def serialize(self, csv_row, column):
        return

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