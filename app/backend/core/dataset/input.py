from itertools import islice
import csv, sys
import copy
import abc
import numpy as np
import json
import os


class Schema(object):
    def __init__(self, columns, csv_file_path=None, train_csv_file_path=None, validation_scv_file_path=None, header=False, delimiter=','):
        self._columns = columns
        self._csv_file_path = csv_file_path
        self._train_csv_file_path = train_csv_file_path
        self._validation_scv_file_path = validation_scv_file_path
        self._header = header
        self._delimiter = delimiter

    @classmethod
    def from_csv(cls, csv_path, test_size=70, header=False, delimiter=','):
        columns = cls._build_from_csv(csv_file_path=csv_path, header=header, delimiter=delimiter)
        return Schema(columns=columns, csv_file_path=csv_path, header=header, delimiter=delimiter)

    @classmethod
    def from_train_and_test_csv(cls, train_csv_path, validation_scv_file_path, header=False, delimiter=','):
        train_csv_columns = cls._build_from_csv(csv_file_path=train_csv_path, header=header, delimiter=delimiter)
        test_scv_columns = cls._build_from_csv(csv_file_path=validation_scv_file_path, header=header, delimiter=delimiter)
        if not (len(train_csv_columns) == len(test_scv_columns)):
            raise Exception('Train and test file has different columns number')
        for idx, column in enumerate(train_csv_columns):
            if column.name != test_scv_columns[idx].name:
                raise Exception('Column names or order in train and test datasets are not equals')
        return Schema(columns=train_csv_columns, train_csv_file_path=train_csv_path, validation_scv_file_path=validation_scv_file_path, header=header, delimiter=delimiter)

    @classmethod
    def _build_from_csv(cls, csv_file_path, header, delimiter):
        delimiter = delimiter.strip()
        if len(delimiter) < 0 or len(delimiter) > 1:
            raise Exception('Invalid delimiter [%s]' % delimiter)
        header_row = [col.strip() for col in cls.read_n_rows(csv_file_path, delimiter, 1)[0]]
        if header:
            duplicates = set([x for x in header_row if header_row.count(x) > 1])
            if len(duplicates) > 0:
                raise Exception("Should be no duplicates in CSV header: " + ", ".join([col for col in duplicates]))
            columns = [Column(name=item, columns_indexes=[index]) for index, item in enumerate(header_row)]
        else:
            columns = [Column(name='col_' + str(index), columns_indexes=[index]) for index in range(0, len(header_row))]

        return columns

    @classmethod
    def read_n_rows(cls, csv_file_path, delimiter, rows_number):
        rows = []
        with open(csv_file_path, 'rb') as f:
            reader = csv.reader(f, delimiter=str(delimiter))
            try:
                for row in islice(reader, 0, rows_number):
                    row = [e.strip() for e in row]
                    rows.append(row)
            except csv.Error as e:
                sys.exit('Broken line: file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

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
    def train_csv_file_path(self):
        return self._train_csv_file_path

    @property
    def validation_scv_file_path(self):
        return self._validation_scv_file_path

    @property
    def header(self):
        return self._header

    @property
    def delimiter(self):
        return self._delimiter

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

    def print_columns(self):
        print ", ".join([col.name for col in self._columns])

    def print_data(self):
        print "First 10 records:"
        csv_file_path = self.csv_file_path if self._csv_file_path is not None else self._train_csv_file_path
        for index, row in enumerate(self.read_n_rows(csv_file_path, self._delimiter, 10)):
            if not (index == 0 and self.header == True):
                print row


class Input(object):
    def __init__(self, schema=None):
        if schema is not None:
            if not isinstance(schema, Schema):
                raise TypeError("Pass Schema instance as an argument")
            else:
                self._input_schema = schema
                self._csv_file_path = schema.csv_file_path
                self._train_csv_file_path = schema.train_csv_file_path
                self._validation_scv_file_path = schema.validation_scv_file_path
                self._header = schema.header
                self._delimiter = schema.delimiter
                self._delimiter = schema.delimiter
                self._columns = []

    @property
    def csv_file_path(self):
        return self._csv_file_path

    @csv_file_path.setter
    def csv_file_path(self, csv_file_path):
        self._csv_file_path = csv_file_path

    @property
    def train_csv_file_path(self):
        return self._train_csv_file_path

    @train_csv_file_path.setter
    def train_csv_file_path(self, train_csv_file_path):
        self._train_csv_file_path = train_csv_file_path

    @property
    def validation_scv_file_path(self):
        return self._validation_scv_file_path

    @validation_scv_file_path.setter
    def validation_scv_file_path(self, validation_scv_file_path):
        self._validation_scv_file_path = validation_scv_file_path

    @property
    def header(self):
        return self._header

    @header.setter
    def header(self, header):
        self._header = header

    @property
    def delimiter(self):
        return self._delimiter

    @delimiter.setter
    def delimiter(self, delimiter):
        self._delimiter = delimiter

    @property
    def columns(self):
        return self._columns

    @columns.setter
    def columns(self, columns):
        self._columns = columns

    def add_numeric_column(self, column_name):
        index, column = self._find_column_in_schema(column_name)
        self.columns.append(NumericColumn.from_column(column))

    def add_categorical_column(self, column_name):
        index, column = self._find_column_in_schema(column_name)
        self.columns.append(CategoricalColumn.from_column(column))

    def add_vector_column(self, column_name):
        index, column = self._find_column_in_schema(column_name)
        self.columns.append(VectorColumn.from_column(column))

    def add_column(self, column_name, input_column):
        index, column = self._find_column_in_schema(column_name)
        input_column.csv_file_path(os.path.dirname(self.csv_file_path))
        input_column.name = column_name
        input_column.columns_indexes = column.columns_indexes
        self.columns.append(input_column)

    def _find_column_in_schema(self, column_name):
        for index, schema_column in enumerate(self._input_schema.columns):
            if schema_column.name == column_name:
                return index, schema_column
        raise Exception("No column with name %s in schema." % column_name)

    @classmethod
    def from_schema(dls, schema):
        input = Input()
        if 'csv_file_path' in schema:
            input.csv_file_path = schema['csv_file_path']
        if 'train_csv_file_path' in schema:
            input.train_csv_file_path = schema['train_csv_file_path']
        if 'test_scv_file_path' in schema:
            input.validation_scv_file_path = schema['validation_scv_file_path']
        if 'header' in schema:
            input.header = True if schema['header'] == 'True' else False
        if 'delimiter' in schema:
            input.delimiter = str(schema['delimiter'])

        from img2d import Img2DColumn
        columns = []
        for column_schema in schema['columns']:
            column_type = str(column_schema['type'])
            if column_type == Column.Type.NUMERIC:
                columns.append(NumericColumn.from_schema(column_schema))
            elif column_type == Column.Type.VECTOR:
                columns.append(VectorColumn.from_schema(column_schema))
            elif column_type == Column.Type.CATEGORICAL:
                columns.append(CategoricalColumn.from_schema(column_schema))
            elif column_type == Column.Type.IMG_2D:
                img2d = Img2DColumn.from_schema(column_schema)
                img2d.csv_file_path(os.path.dirname(input.csv_file_path))
                columns.append(img2d)
            else:
                raise TypeError("Unsupported column type: %s" % column_type)
        input.columns = columns
        return input

    def serialize(self):
        return {'columns': [column.schema for column in self._columns]}


class Column(object):
    def __init__(self, name=None, columns_indexes=None, type=None, reader=None, ser_de=None, metadata=None):
        if not (name is None or isinstance(name, str)):
            raise Exception("Name field should be string.")
        if not (columns_indexes is None or isinstance(columns_indexes, list)):
            raise Exception("Columns indexes field should be list.")
        if not (type is None or isinstance(type, str)):
            raise Exception("Type field should be string.")
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
        if not (pre_transforms is None or isinstance(pre_transforms, list)):
            raise Exception("pre_transforms field should be list.")
        if not (post_transforms is None or isinstance(post_transforms, list)):
            raise Exception("post_transforms field should be list.")
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
        if 'metadata' in column_schema:
            metadata = CategoricalColumnMetadata.deserialize(column_schema['metadata'])
        else:
            metadata = None
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
    def __init__(self, categories=None, categories_count=None):
        self._categories = set()
        if categories is not None:
            self._categories = set(categories)
        self._categories_count = {}
        if categories_count is not None:
            self._categories_count = categories_count

    @property
    def categories(self):
        return list(self._categories)

    @property
    def categories_count(self):
        return self._categories_count

    def aggregate(self, category):
        self._categories.add(category)
        self._categories_count[category] = self._categories_count.get(category, 0) + 1

    def serialize(self):
        dumps = json.dumps(self._categories_count)
        return {'categories': self.categories, 'categories_count': dumps}

    @classmethod
    def deserialize(cls, schema):
        categories_count = {}
        for key, value in json.loads(schema['categories_count']).iteritems():
            categories_count[str(key)] = int(value)
        return CategoricalColumnMetadata(schema['categories'], categories_count)