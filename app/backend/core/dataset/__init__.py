from itertools import islice
import csv, sys


class Dataset(object):
    def __init__(self, workspace, path):
        self.workspace = workspace
        self.metadata = self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Dataset from Path" + path

    def load_batch(self, batch_size):
        print ""


class Input(object):
    def __init__(self, csv_file_path, with_header=False):
        self.csv_file_path = csv_file_path
        header_row = self._read_rows(self.csv_file_path, 1)[0]
        if with_header:
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
            raise Exception("Input columns size: %d is not compatible with existing data size: %d" % (l, len(self._columns)))
        self._columns = columns

    @property
    def column_by_index(self, index):
        return self._columns[index]

    @column_by_index.setter
    def column_by_index(self, index, name):
        self._columns[index] = name

    def print_columns(self):
        print self._columns


class Data(object):
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"

    def to_data_frame(self):
        raise NotImplementedError("Please Implement this method")


class Image2DData(Data):
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"


class Metadata(object):
    def __init__(self):
        print ""


class Image2DMetadata(Metadata):
    def __init__(self):
        print ""


class DataType:
    Image2D, Image3D, Text = range(3)


if __name__ == '__main__':
    input = Input("/home/sergo/Work/Gitlab/DLS/data-test/idx-simple4c_test-all.csv", with_header=True)
    input.print_columns()