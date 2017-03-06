from itertools import islice
import csv, sys
import copy
import abc
import numpy as np


class Schema(object):
    separator = ','

    def __init__(self, csv_file_path=None, header=False, separator=None):
        self._csv_file_path = csv_file_path
        if csv_file_path is not None:
            self._build_from_csv(csv_file_path, header, separator)

    def _build_from_csv(self, csv_file_path, header=False, separator=None):
        self._csv_file_path = csv_file_path
        if separator is not None:
            tseparator = separator.strip()
            if len(tseparator) < 0 or len(tseparator) > 1:
                raise Exception('Invalid separator [%s]' % separator)
            self.separator = tseparator
        header_row = [col.strip() for col in self.read_n_rows(1)[0]]
        if header:
            duplicates = set([x for x in header_row if header_row.count(x) > 1])
            if len(duplicates) > 0:
                raise Exception("Should be no duplicates in CSV header: " + ", ".join([col for col in duplicates]))
            self._columns = [Column(name=item, columns_indexes=[index]) for index, item in enumerate(header_row)]
        else:
            self._columns = [Column(name='col_' + str(index), columns_indexes=[index]) for index in range(0, len(header_row))]

    def read_n_rows(self, rows_number):
        rows = []
        with open(self._csv_file_path, 'rb') as f:
            reader = csv.reader(f, delimiter=str(self.separator))
            try:
                for row in islice(reader, 0, rows_number):
                    rows.append(row)
            except csv.Error as e:
                sys.exit('Broken line: file %s, line %d: %s' % (self._csv_file_path, reader.line_num, e))

        return rows

    def __setitem__(self, old_name, new_name):
        columns = [c.name for c in self._columns]
        if old_name != new_name and columns.count(new_name) > 0:
            raise Exception("Should be no duplicates in columns: " + new_name)
        for column in self._columns:
            if column.name == old_name:
                column.name = new_name.strip()

    @property
    def csv_file_path(self):
        return self._csv_file_path

    @property
    def columns(self):
        return self._columns

    def update_columns(self, columns):
        self._columns = columns

    @columns.setter
    def columns(self, columns):
        l = len(columns)
        if (l > len(self._columns)) or (l < len(self._columns)):
            raise Exception("Passed columns number: %d is not compatible with Schema current columns number: %d"
                            % (l, len(self._columns)))
        duplicates = set([x for x in columns if columns.count(x) > 1])
        if len(duplicates) > 0:
            raise Exception("Should be no duplicates in columns: " + ", ".join([col for col in duplicates]))
        for index, item in enumerate(columns):
            self._columns[index].name = item.strip()

    def drop_column(self, column_name):
        for index, column in enumerate(copy.deepcopy(self._columns)):
            if column.name == column_name:
                self._columns.remove(self._columns[index])

    def merge_columns(self, new_column_name, columns_to_merge):
        if not isinstance(columns_to_merge, list):
            raise TypeError("Arg columns_to_merge should be list")
        columns_indexes = []
        for column in copy.deepcopy(self._columns):
            if column.name in columns_to_merge:
                columns_indexes.extend(column.columns_indexes)
                self.drop_column(column.name)
        self._columns.append(Column(new_column_name, columns_indexes))

    def merge_columns_in_range(self, new_column_name, range=()):
        if not isinstance(range, tuple):
            raise TypeError("Arg range should be Tuple")
        if range[0] >= range[1]:
            raise Exception("Start index of the range can't be higher or equal than end index")
        if range[0] < 0 or range[1] >= len(self._columns):
            raise Exception("Range is out of length of schema, last schema index: %d" % (len(self._columns) - 1))
        columns_indexes = []
        for index, column in enumerate(copy.deepcopy(self._columns)):
            if range[0] <= index <= range[1]:
                columns_indexes.extend(column.columns_indexes)
                self.drop_column(column.name)
        self._columns.append(Column(new_column_name, columns_indexes))

    @staticmethod
    def deserialize(schema_json):
        schema = Schema()
        if 'csv_file_path' in schema_json:
            schema = Schema(schema_json['csv_file_path'], schema_json['header'], schema_json['separator'])
            columns_indexes_number = sum(len(column["index"]) for column in schema_json['columns'])
            if columns_indexes_number != len(schema.columns):
                raise TypeError(
                    "Columns indexes number in config is not equal to csv file: %s" % columns_indexes_number)

        from img2d import Img2DColumn
        _columns = []
        for column_schema in schema_json['columns']:
            column_type = str(column_schema['type'])
            if column_type == Column.Type.NUMERIC:
                _columns.append(NumericColumn.from_schema(column_schema))
            elif column_type == Column.Type.VECTOR:
                _columns.append(VectorColumn.from_schema(column_schema))
            elif column_type == Column.Type.CATEGORICAL:
                _columns.append(CategoricalColumn.from_schema(column_schema))
            elif column_type == Column.Type.IMG_2D:
                _columns.append(Img2DColumn.from_schema(column_schema))
            else:
                raise TypeError("Unsupported column type: %s" % column_type)
        schema.update_columns(_columns)
        return schema

    def serialize(self):
        return {'columns': [column.schema for column in self._columns]}

    def print_columns(self):
        print ", ".join([col.name for col in self._columns])

    def print_data(self):
        print "First 10 records:"
        for row in self.read_n_rows(10):
            print row


class Input(object):
    def __init__(self, schema=None):
        if schema is not None and not isinstance(schema, Schema):
            raise TypeError("Pass Schema instance as an argument")
        self._schema = schema

    @property
    def schema(self):
        return self._schema

    class Builder(object):
        def __init__(self, schema_config):
            self._schema_config = schema_config

        def build(self):
            return Input(Schema.deserialize(self._schema_config))

    def add_numeric_column(self, column_name):
        index, column = self._find_column_in_schema(column_name)
        self._schema.columns[index] = NumericColumn.from_column(column)

    def add_categorical_column(self, column_name):
        index, column = self._find_column_in_schema(column_name)
        self._schema.columns[index] = CategoricalColumn.from_column(column)

    def add_vector_column(self, column_name):
        index, column = self._find_column_in_schema(column_name)
        self._schema.columns[index] = VectorColumn.from_column(column)

    def add_column(self, column_name, input_column):
        index, column = self._find_column_in_schema(column_name)
        input_column.name = column_name
        input_column.columns_indexes = column.columns_indexes
        self._schema.columns[index] = input_column

    def _find_column_in_schema(self, column_name):
        for index, schema_column in enumerate(self._schema.columns):
            if schema_column.name == column_name:
                return index, schema_column
        raise Exception("No column with name %s in schema." % column_name)


class Column(object):
    def __init__(self, name=None, columns_indexes=None, type=None, reader=None, ser_de=None, metadata=None):
        self._name = name
        # CSV corresponding columns indexes
        self._columns_indexes = columns_indexes
        self._type = type
        self._reader = reader
        self._ser_de = ser_de
        self._metadata = metadata

    class Type:
        NUMERIC = "NUMERIC"
        VECTOR = "VECTOR"
        CATEGORICAL = "CATEGORICAL"
        IMG_2D = 'IMG_2D'
        IMG_3D = 'IMG_3D'

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, name):
        self._name = name

    @property
    def columns_indexes(self):
        return self._columns_indexes

    @columns_indexes.setter
    def columns_indexes(self, columns_indexes):
        self._columns_indexes = columns_indexes

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, type):
        self._type = type

    @property
    def reader(self):
        return self._reader

    @reader.setter
    def reader(self, reader):
        self._reader = reader

    @property
    def ser_de(self):
        return self._ser_de

    @ser_de.setter
    def ser_de(self, ser_de):
        self._ser_de = ser_de

    @property
    def metadata(self):
        return self._metadata

    @metadata.setter
    def metadata(self, metadata):
        self._metadata = metadata

    @classmethod
    def from_column(cls, column):
        return globals()[cls.__name__](column.name, column.columns_indexes)

    @property
    def schema(self):
        schema = {'name': self.name, 'type': self.type}
        if self._metadata is not None:
            schema['metadata'] = self._metadata.serialize()
        return schema

    def process_on_write(self, record):
        data = self.reader.read(record)
        return self.ser_de.serialize(data)

    def process_on_read(self, record):
        return self._ser_de.deserialize(record[self._name])


class ComplexColumn(Column):
    def __init__(self, name=None, type=None, columns_indexes=None, ser_de=None, reader=None, metadata=None,
                 pre_transforms=[], post_transforms=[]):
        super(ComplexColumn, self).__init__(name=name, type=type, columns_indexes=columns_indexes, ser_de=ser_de,
                                            reader=reader, metadata=metadata)
        self._pre_transforms = pre_transforms
        self._post_transforms = post_transforms

    @property
    def pre_transforms(self):
        return self._pre_transforms

    @pre_transforms.setter
    def pre_transforms(self, pre_transforms):
        self._pre_transforms = pre_transforms

    @property
    def post_transforms(self):
        return self._post_transforms

    @post_transforms.setter
    def post_transforms(self, post_transforms):
        self._post_transforms = post_transforms

    @property
    def schema(self):
        schema = super(ComplexColumn, self).schema
        pre_transforms = []
        for transform in self.pre_transforms:
            pre_transforms.append(transform.schema)
        schema['pre_transforms'] = pre_transforms
        post_transforms = []
        for transform in self.post_transforms:
            post_transforms.append(transform.schema)
        schema['post_transforms'] = post_transforms
        return schema

    def process_on_write(self, record):
        data = self.reader.read(record)
        if self._metadata is not None:
            self._metadata.aggregate(data)
        for transform in self._pre_transforms:
            data = transform.apply(data)
        return self.ser_de.serialize(data)

    def process_on_read(self, record):
        value = self._ser_de.deserialize(record[self._name])
        for transform in self._post_transforms:
            value = transform.apply(value)
        return value


class ColumnTransform(object):
    def __init__(self):
        pass

    @staticmethod
    def type():
        pass

    def apply(self, data):
        pass

    @property
    @abc.abstractmethod
    def serialize(self):
        pass


class ColumnReader(object):
    def __init__(self, column):
        self._column = column

    @abc.abstractmethod
    def read(self, csv_row):
        pass


class ColumnSerDe(object):
    @abc.abstractmethod
    def serialize(self, data):
        pass

    @abc.abstractmethod
    def deserialize(self, data):
        pass


class ColumnMetadata(object):
    def aggregate(self, data):
        pass

    def path(self, path):
        # Path to save metadata if required
        pass

    def serialize(self):
        pass

    @classmethod
    def deserialize(cls, schema):
        pass

    def merge(self, metadata):
        pass


class NumericColumn(Column):
    def __init__(self, name=None, columns_indexes=None):
        super(NumericColumn, self).__init__(name, columns_indexes, Column.Type.NUMERIC,
                                            NumericColumn.Reader(self), NumericColumn.SerDe(self))

    @classmethod
    def from_schema(cls, column_schema):
        name = str(column_schema['name'])
        index = None
        if 'index' in column_schema:
            index = column_schema['index']
        return NumericColumn(name=name, columns_indexes=index)

    class Reader(ColumnReader):
        def read(self, csv_row):
            return csv_row[self._column.columns_indexes[0]]

    class SerDe(ColumnSerDe):
        def __init__(self, column):
            self._column = column

        def serialize(self, data):
            return float(data)

        def deserialize(self, data):
            return float(data)


class VectorColumn(Column):
    def __init__(self, name=None, columns_indexes=None):
        super(VectorColumn, self).__init__(name, columns_indexes, Column.Type.VECTOR,
                                           VectorColumn.Reader(self), VectorColumn.SerDe(self))

    @classmethod
    def from_schema(cls, column_schema):
        name = str(column_schema['name'])
        index = None
        if 'index' in column_schema:
            index = column_schema['index']
        return VectorColumn(name=name, columns_indexes=index)

    class Reader(ColumnReader):
        def read(self, csv_row):
            return [float(csv_row[i]) for i in self._column.columns_indexes]

    class SerDe(ColumnSerDe):
        def __init__(self, column):
            self._column = column

        def serialize(self, data):
            return np.array(data).tostring()

        def deserialize(self, data):
            return np.frombuffer(data, dtype=np.float64)


class CategoricalColumn(Column):
    def __init__(self, name=None, columns_indexes=None, metadata=None):
        super(CategoricalColumn, self).__init__(name=name,
                                                columns_indexes=columns_indexes,
                                                type=Column.Type.CATEGORICAL,
                                                reader=CategoricalColumn.Reader(self),
                                                ser_de=CategoricalColumn.SerDe(self),
                                                metadata=metadata)
        if self._metadata is None:
            self._metadata = CategoricalColumnMetadata()

    @property
    def schema(self):
        schema = super(CategoricalColumn, self).schema
        schema['metadata'] = self.metadata.serialize()
        return schema

    @classmethod
    def from_schema(cls, column_schema):
        name = str(column_schema['name'])
        index = None
        if 'index' in column_schema:
            index = column_schema['index']
        metadata = CategoricalColumnMetadata.deserialize(column_schema['metadata'])
        return CategoricalColumn(name=name, columns_indexes=index, metadata=metadata)

    class Reader(ColumnReader):
        def read(self, csv_row):
            cat_val = csv_row[self._column.columns_indexes[0]]
            return self._column.metadata.categories.index(cat_val)

    class SerDe(ColumnSerDe):
        def __init__(self, column):
            self._column = column

        def serialize(self, data):
            return int(data)

        def deserialize(self, data):
            return int(data)


class CategoricalColumnMetadata(ColumnMetadata):
    def __init__(self, categories=None):
        self._data = set()
        if categories is not None:
            self._data = set(categories)

    @property
    def categories(self):
        return list(self._data)

    def aggregate(self, data):
        self._data.add(data)

    def serialize(self):
        return {'categories': self.categories}

    @classmethod
    def deserialize(cls, schema):
        return CategoricalColumnMetadata(schema['categories'])