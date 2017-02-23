from Queue import Empty
from multiprocessing import Process, Value, Lock, Queue
import numpy as np
import csv, sys
import os
import h5py
import abc
import random
import json
import logging
from img2d import Img2DSerDe, Img2DColumn
from input import Schema, Input, Column, BasicColumn, BasicColumnSerDe, ComplexColumn


class Dataset(object):
    DATA_DIR_NAME = "data"
    FILE_NAME = "dataset.processed"
    SCHEMA_FILE = "schema.json"

    def __init__(self, schema, path):
        self._schema = schema
        self._path = path
        self._record_reader = RecordReader.factory("HDF5", path)

    def get_batch(self, batch_size=64):
        data = {}
        for column in self._schema.columns:
            data[column.name] = []
        records_count = self._record_reader.records_count
        i = 0
        while i < batch_size:
            inx = random.randrange(0, records_count)
            record = self._record_reader.read(inx)
            for column in self._schema.columns:
                value = column.ser_de.deserialize(record[column.name])
                data[column.name].append(value)
            i += 1
        return Data(data)

    @staticmethod
    def load(path):
        with open(os.path.join(path, Dataset.DATA_DIR_NAME, Dataset.SCHEMA_FILE)) as s:
            return Dataset(Schema.deserialize(json.load(s)), path)

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
            self._dataset_root_dir = os.path.join(root_dir, self._name + "-" + str(random.getrandbits(64)))
            self._dataset_data_dir = os.path.join(self._dataset_root_dir, Dataset.DATA_DIR_NAME)
            os.makedirs(self._dataset_data_dir)

        def build(self):
            self._validate_data_schema()
            self._save_data_schema()
            csv_rows_chunks = np.array_split(self._process_csv_file(), self._parallelism_level)
            processor = []
            results = Queue()
            for i in range(self._parallelism_level):
                p = RecordProcessor(self._input.schema.columns, results, csv_rows_chunks[i])
                processor.append(p)
            for p in processor: p.start()
            record_write = RecordWriter.factory(self._storage_type, self._dataset_data_dir, self._input.schema.columns)
            completed_processor_num = 0
            record_idx = 0
            try:
                while completed_processor_num < self._parallelism_level:
                    record = results.get(block=True, timeout=5)
                    if record is not None:
                        record_write.write(record, record_idx)
                        record_idx += 1
                    else:
                        completed_processor_num += 1
            except Empty:
                logging.warning("Not all the threads completed as expected")

            record_write.close()

            print "Records processed: " + str(record_idx)

            return Dataset(self._input.schema, self._dataset_root_dir)

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
                            if column.type == Column.Type.CATEGORICAL:
                                column.metadata.add(row[column.columns_indexes[0]])
                except csv.Error as e:
                    sys.exit('Broken line: file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

            return rows

        def _validate_data_schema(self):
            for column in self._input.schema.columns:
                if column.type is None:
                    raise TypeError("Please specify type for column: %s" % column.name)

        def _save_data_schema(self):
            with open(os.path.join(self._dataset_data_dir, Dataset.SCHEMA_FILE), 'w') as f:
                f.write(json.dumps(self._input.schema.serialize()))


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
    def factory(type, data_dir):
        if type == "HDF5":
            return HDF5RecordReader(data_dir)
        raise TypeError("Unsupported Record Writer Type: " + type)

    factory = staticmethod(factory)

    def read(self, idx):
        pass


class HDF5RecordReader(object):
    def __init__(self, data_dir):
        data_file = h5py.File(os.path.join(data_dir, Dataset.DATA_DIR_NAME, Dataset.FILE_NAME), 'r')
        self._data = data_file['data']
        self._data_keys = data_file['data'].keys()

    @property
    def records_count(self):
        return len(self._data_keys)

    def read(self, idx):
        key = self._data_keys[idx]
        record = self._data[key]
        return record


class HDF5RecordWriter(RecordWriter):
    def __init__(self, data_dir, columns):
        super(HDF5RecordWriter, self).__init__(data_dir, columns)
        self._file = h5py.File(os.path.join(self._data_dir, Dataset.FILE_NAME), 'w')
        self._root_data = self._file.create_group('data')

    def write(self, record, idx):
        row_data = self._root_data.create_group('row_%08d' % idx)
        for col_name, value in record.iteritems():
            self._save(row_data, col_name, value)

    @staticmethod
    def _save(data, col_name, value):
        if isinstance(value, dict):
            sub_cal_name = data.create_group(col_name)
            for key in value:
                sub_cal_name[key] = value[key]
        else:
            data[col_name] = value

    def close(self):
        self._file.close()


class RecordProcessor(Process):
    def __init__(self, columns, result_queue, csv_rows):
        super(RecordProcessor, self).__init__()
        self._columns = columns
        self._result_queue = result_queue
        self._csv_rows = csv_rows

    def run(self):
        for csv_row in self._csv_rows:
            # Trim row entries
            csv_row = [e.strip() for e in csv_row]
            precessed_row = {}
            for column in self._columns:
                precessed_row[column.name] = column.process(csv_row)
            self._result_queue.put(precessed_row)
        # Signalize that processing is completed
        self._result_queue.put(None)


class Data(object):
    def __init__(self, data):
        self._data = {}
        for key in data.keys():
            self._data[key] = np.array(data[key])

    def __getitem__(self, column_name):
        return self._data[column_name]


class Metadata(object):
    def __init__(self):
        print ""


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
    input = Input(schema=schema)
    # dataset = Dataset()
    print ('----')
