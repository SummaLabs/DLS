from itertools import islice
import csv, sys


class Schema(object):
    def __init__(self, csv_file_path, header=False):
        self.csv_file_path = csv_file_path
        header_row = Schema._read_n_rows(self.csv_file_path, 1)[0]
        if header:
            self._columns = [Schema.Column(item, [index]) for index, item in enumerate(header_row)]
        else:
            self._columns = [Schema.Column('col_' + str(index), [index]) for index in range(0, len(header_row))]

    @staticmethod
    def _read_n_rows(csv_file_path, rows_number):
        rows = []
        with open(csv_file_path, 'rb') as f:
            reader = csv.reader(f)
            try:
                for row in islice(reader, 0, rows_number):
                    rows.append(row)
            except csv.Error as e:
                sys.exit('file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

        return rows

    class Column(object):
        def __init__(self, name, columns_indexes):
            self._name = name
            # CSV corresponding columns indexes
            self._columns_indexes = columns_indexes

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

    def __setitem__(self, old_name, new_name):
        for column in self._columns:
            if column.name == old_name:
                column.name = new_name

    @property
    def columns(self):
        return self._columns

    @columns.setter
    def columns(self, columns):
        l = len(columns)
        if (l > len(self._columns)) or (l < len(self._columns)):
            raise Exception("Passed columns number: %d is not compatible with Schema current columns number: %d" % (l, len(self._columns)))
        for index, item in enumerate(columns):
            self._columns[index].name = item

    def drop_column(self, column_name):
        for column in list(self._columns):
            if column.name == column_name:
                self._columns.remove(column)

    def merge_columns(self, new_column_name, columns_to_merge = []):
        pass

    def merge_columns_in_range(self, new_column_name, range = []):
        pass

    def print_columns(self):
        print ", ".join([col.name for col in self._columns])

    def print_data(self):
        print "First 10 records:"
        for row in Schema._read_n_rows(self.csv_file_path, 10):
            print row


class PathInput(object):
    def __init__(self, files_base_path, reader):
        pass


class CSVInput(object):
    def __init__(self, schema):
        if not isinstance(schema, Schema):
            raise TypeError("Must be set to an Schema")
        pass

    def transform_column(self, column_name, transforms = [], reader = None):
        pass
