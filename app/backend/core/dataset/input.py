from itertools import islice
import csv, sys


class Schema(object):
    def __init__(self, csv_file_path, header=False):
        self.csv_file_path = csv_file_path
        header_row = self._read_rows(self.csv_file_path, 1)[0]
        if header:
            self._columns = header_row
        else:
            self._columns = range(0, len(header_row))

    def _read_rows(self, csv_file_path, rows_number):
        rows = []
        with open(csv_file_path, 'rb') as f:
            reader = csv.reader(f)
            try:
                for row in islice(reader, 0, rows_number):
                    rows.append(row)
            except csv.Error as e:
                sys.exit('file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

        return rows

    @property
    def columns(self):
        return self._columns

    @columns.setter
    def columns(self, columns):
        l = len(columns)
        if (l > len(self._columns)) or (l < len(self._columns)):
            raise Exception("Passed columns number: %d is not compatible with current columns number: %d" % (l, len(self._columns)))
        self._columns = columns

    def drop_column(self, column_name):
        pass

    def merge_columns(self, column_names):
        pass

    def print_columns(self):
        print self._columns

    def print_data(self):
        print self._read_rows(self.csv_file_path, 10)


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
