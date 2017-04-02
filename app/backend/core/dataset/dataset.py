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
from input import Schema, Input, Column, ComplexColumn, NumericColumn, VectorColumn, CategoricalColumn


class Dataset(object):
    DATA_DIR_NAME = "data"
    DATA_FILE = "dataset.processed"
    SCHEMA_FILE = "schema.json"

    def __init__(self, input, path, metadata, id, train_range, validation_range):
        self._input = input
        self._path = path
        self._metadata = metadata
        self._id = id
        self._train_range = train_range
        self._validation_range = validation_range
        self._record_reader = RecordReader.factory("HDF5", path)

    @property
    def metadata(self):
        return self._metadata

    @property
    def path(self):
        return self._path

    @property
    def id(self):
        return self._id

    def read_record(self, index):
        serialized_record = self._record_reader.read(index)
        return [column.process_on_read(serialized_record) for column in self._input.columns]

    def _get_batch(self, records_range, batch_size):
        data = {}
        for column in self._input.columns:
            data[column.name] = []
        i = 0
        while i < batch_size:
            inx = random.randrange(records_range[0], records_range[1])
            record = self.read_record(inx)
            for index, column in enumerate(self._input.columns):
                value = record[index]
                if isinstance(value, np.ndarray) and value.ndim > 1:
                    value = value.ravel()
                data[column.name].append(value)
            i += 1
        return Data(data)

    def get_train_batch(self, batch_size=64):
        return self._get_batch(self._train_range, batch_size)

    def get_validation_batch(self, batch_size=64):
        return self._get_batch(self._validation_range, batch_size)

    @staticmethod
    def load(path):
        with open(os.path.join(path, Dataset.DATA_DIR_NAME, Dataset.SCHEMA_FILE)) as s:
            dataset_serialized = json.load(s)
            input = Input.from_schema(dataset_serialized["schema"])
            metadata_serialized = dataset_serialized["metadata"]
            metadata = Metadata(metadata_serialized["dataset-id"], int(metadata_serialized["data-size"]),
                                int(metadata_serialized["records-count"]), input.columns)
            train_range = dataset_serialized["train-range"]
            validation_range = dataset_serialized["validation-range"]
            return Dataset(input, path, metadata, dataset_serialized["dataset-id"], train_range, validation_range)

    class Builder(object):
        def __init__(self, input, name, root_dir, test_dataset_percentage=70, parallelism_level=2, storage_type="HDF5", progressor=None):
            if not isinstance(input, Input):
                raise TypeError("Must be set to an Input")
            self._input = input
            self._name = name
            self._root_dir = root_dir
            self._test_dataset_percentage = test_dataset_percentage
            self._parallelism_level = parallelism_level
            self._storage_type = storage_type
            self._train_range = []
            self._validation_range = []
            self._init(root_dir)

        def _init(self, root_dir):
            self._dataset_id = self._name + "-" + str(random.getrandbits(64))
            self._dataset_root_dir = os.path.join(root_dir, self._dataset_id)
            self._dataset_data_dir = os.path.join(self._dataset_root_dir, Dataset.DATA_DIR_NAME)
            os.makedirs(self._dataset_data_dir)

        def build(self, progressor=None):
            self._validate_data_schema()
            indexed_csv_rows = self._process_csv_files()
            indexed_csv_rows_chunks = np.array_split(indexed_csv_rows, self._parallelism_level)
            processor = []
            processed_records = Queue()
            for i in range(self._parallelism_level):
                p = RecordProcessor(self._input.columns, processed_records, indexed_csv_rows_chunks[i])
                processor.append(p)
            for p in processor: p.start()
            record_write = RecordWriter.factory(self._storage_type, self._dataset_root_dir, self._input.columns)
            completed_processor_num = 0
            record_idx = 0
            aggregated_column_metadata = []
            try:
                while completed_processor_num < self._parallelism_level:
                    result = processed_records.get(block=True, timeout=50)
                    if not isinstance(result, ProcessingResult):
                        index, row = result
                        record_write.write(row, index)
                        record_idx += 1
                        if (progressor != None):
                            progressor.progress = 100 * record_idx / len(indexed_csv_rows)
                    else:
                        completed_processor_num += 1
                        aggregated_column_metadata.append(result.column_metadata)
            except Empty:
                logging.warning("Not all the threads completed as expected")
            record_write.close()

            self._merge_column_metadata(aggregated_column_metadata)
            dataset_metadata = Metadata.create(self._dataset_id, os.path.join(self._dataset_data_dir, Dataset.DATA_FILE), record_idx, self._input.columns)
            self._serialize_dataset_schema(dataset_metadata)

            print "Records processed: " + str(record_idx)

            return Dataset(self._input, self._dataset_root_dir, dataset_metadata, self._dataset_id, self._train_range, self._validation_range)

        def _merge_column_metadata(self, aggregated_metadata):
            """
            :param aggregated_metadata: List of column's metadata from different processes.
            :return:
            """
            metadata_by_column = {}
            for column in self._input.columns:
                if column.metadata is not None:
                    metadata_by_column[column.name] = []

            for column_metadata in aggregated_metadata:
                for column_name in column_metadata:
                    metadata_by_column[column_name].append(column_metadata[column_name])

            for column in self._input.columns:
                if column.metadata is not None:
                    column.metadata.merge(metadata_by_column[column.name])

        def _process_csv_files(self):
            rows = []
            csv_file_path = self._input.csv_file_path
            if self._input.csv_file_path is not None:
                rows = self._read_csv(csv_file_path)
                random.shuffle(rows)
                test_dataset_records_num = int(round(self._test_dataset_percentage * len(rows)) / 100)
                self._train_range = [0, test_dataset_records_num]
                self._validation_range = [test_dataset_records_num, len(rows)]
            else:
                train_rows = self._read_csv(self._input.train_csv_file_path)
                random.shuffle(train_rows)
                self._train_range = [0, len(train_rows)]
                rows.extend(train_rows)
                validation_rows = self._read_csv(self._input.validation_scv_file_path)
                random.shuffle(validation_rows)
                self._validation_range = [len(train_rows), len(train_rows) + len(validation_rows)]
                rows.extend(validation_rows)
            columns = self._input.columns
            for row in rows:
                for column in columns:
                    if (isinstance(column, NumericColumn) or isinstance(column, VectorColumn) or isinstance(
                            column, CategoricalColumn)) and column.metadata is not None:
                        column.metadata.aggregate(row[column.columns_indexes[0]])

            return [(row, index) for index, row in enumerate(rows)]

        def _read_csv(self, csv_file_path):
            rows = []
            with open(csv_file_path, 'rb') as f:
                reader = csv.reader(f)
                try:
                    for index, row in enumerate(reader):
                        if not self._input.header or self._input.header and index > 0:
                            # Trim row entries
                            row = [e.strip() for e in row]
                            rows.append(row)
                except csv.Error as e:
                    sys.exit('Broken line: file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

            return rows

        def _validate_data_schema(self):
            for column in self._input.columns:
                if column.type is None:
                    raise TypeError("Please specify type for column: %s" % column.name)

        def _serialize_dataset_schema(self, metadata):
            for column in self._input.columns:
                if column.metadata is not None:
                    column.metadata.path(self._dataset_data_dir)
            dataset_schema = {"dataset-id": self._dataset_id,
                                  "metadata": metadata.serialize(),
                                  "train-range": self._train_range,
                                  "validation-range": self._validation_range,
                                  "schema": self._input.serialize()}
            with open(os.path.join(self._dataset_data_dir, Dataset.SCHEMA_FILE), 'w') as f:
                f.write(json.dumps(dataset_schema))


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

    def close(self):
        pass


class RecordReader(object):
    def __init__(self, data_dir):
        self._data_dir = data_dir

    def factory(type, data_dir):
        if type == "HDF5":
            return HDF5RecordReader(data_dir)
        raise TypeError("Unsupported Record Writer Type: " + type)

    factory = staticmethod(factory)

    def read(self, idx):
        pass

    def close(self):
        pass


class HDF5RecordReader(RecordReader):
    def __init__(self, data_dir):
        super(HDF5RecordReader, self).__init__(data_dir)
        self._data_file = h5py.File(os.path.join(data_dir, Dataset.DATA_DIR_NAME, Dataset.DATA_FILE), 'r')
        self._data = self._data_file['data']
        self._data_keys = self._data_file['data'].keys()

    @property
    def records_count(self):
        return len(self._data_keys)

    def read(self, idx):
        key = self._data_keys[idx]
        hdf5_record = self._data[key]
        record = {}
        from h5py import Group
        for key in hdf5_record:
            if isinstance(hdf5_record[key], Group):
                sub_group = hdf5_record[key]
                value = {}
                for sub_key in sub_group:
                    value[sub_key] = sub_group[sub_key].value
                record[key] = (value)
            else:
                record[key] = hdf5_record[key].value
        return record

    def close(self):
        self._data_file.close()


class HDF5RecordWriter(RecordWriter):
    def __init__(self, data_dir, columns):
        super(HDF5RecordWriter, self).__init__(data_dir, columns)
        self._file = h5py.File(os.path.join(self._data_dir, Dataset.DATA_DIR_NAME, Dataset.DATA_FILE), 'w')
        self._root_data = self._file.create_group('data')

    def write(self, record, idx):
        row_data = self._root_data.create_group('row_%08d' % idx)
        for col_name, value in record.iteritems():
            if isinstance(value, dict):
                sub_cal_name = row_data.create_group(col_name)
                for key in value:
                    # https://www.bountysource.com/issues/36647663-save-jpeg-images-in-h5py
                    if isinstance(value[key], str):
                        sub_cal_name[key] = np.void(value[key])
                    else:
                        sub_cal_name[key] = value[key]
            else:
                if isinstance(value, str):
                    row_data[col_name] = np.void(value)
                else:
                    row_data[col_name] = value

    def close(self):
        self._file.close()


class RecordProcessor(Process):
    def __init__(self, columns, result_queue, indexed_csv_rows):
        super(RecordProcessor, self).__init__()
        self._columns = columns
        self._result_queue = result_queue
        self._indexed_csv_rows = indexed_csv_rows

    def run(self):
        for csv_row, index in self._indexed_csv_rows:
            processed_row = {}
            for column in self._columns:
                processed_row[column.name] = column.process_on_write(csv_row)
            self._result_queue.put((index, processed_row))
        # Signalize that processing is completed and send back columns with it's metadata
        self._result_queue.put(ProcessingResult(self._columns))


class ProcessingResult:
    def __init__(self, columns):
        self._column_metadata = {}
        for column in columns:
            if isinstance(column, ComplexColumn):
                self._column_metadata[column.name] = column.metadata

    @property
    def column_metadata(self):
        return self._column_metadata


class Data(object):
    def __init__(self, data):
        self._data = {}
        for key in data.keys():
            self._data[key] = np.array(data[key])

    def __getitem__(self, column_name):
        return self._data[column_name]


class Metadata(object):
    def __init__(self, dataset_id, size, records_count, columns):
        self._dataset_id = dataset_id
        self._size = size
        self._records_count = records_count
        self._columns_metadata = {}
        for column in columns:
            self._columns_metadata[column.name] = column.metadata

    def __getitem__(self, column_name):
        return self._columns_metadata[column_name]

    @property
    def size(self):
        return self._size

    @property
    def dataset_id(self):
        return self._dataset_id

    @property
    def records_count(self):
        return self._records_count

    @property
    def columns_metadata(self):
        return self._columns_metadata

    def serialize(self):
        return {"dataset-id": self._dataset_id, "data-size": self._size, "records-count": self._records_count}

    @classmethod
    def create(cls, dataset_id, dataset_data_path, records_count, columns):
        return Metadata(dataset_id, os.path.getsize(dataset_data_path), records_count, columns)


if __name__ == '__main__':
    from img2d import Img2DColumn, Img2DReader, ImgResizeTransform
    from input import Schema, Input, ColumnSerDe, ColumnSerDe
    from app.backend.api import app_flask
    import os

    path_csv = '../../../../data-test/dataset-image2d/simple4c_test/test-csv-v1.csv'
    if not os.path.isfile(path_csv):
        raise Exception('Cant find file [%s]' % path_csv)
    schema = Schema.from_csv(path_csv, header=True, delimiter=',')
    schema.merge_columns_in_range('col_vector', (2, 4))
    schema.print_data()
    schema['path'] = 'image'
    schema.print_columns()
    input = Input(schema=schema)
    input.add_categorical_column("label")
    input.add_vector_column('col_vector')
    img2d = Img2DColumn(is_related_path=True)
    input.add_column("image", img2d)
    datasets_base_path = app_flask.config['DATASETS_BASE_PATH']
    dataset = Dataset.Builder(input, "test", datasets_base_path, parallelism_level=2).build()
    data = dataset.get_train_batch(5)
    print data['image']
