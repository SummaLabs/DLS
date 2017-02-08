import multiprocessing
import numpy as np
import csv, sys
from input import Input


class Dataset(object):
    def __init__(self, workspace, path):
        self.workspace = workspace
        self.metadata = self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Dataset from Path" + path

    def get_batch(self, batch_size):
        return Data()

    class Builder(object):
        def __init__(self, input, parallelism_level=4):
            if not isinstance(input, Input):
                raise TypeError("Must be set to an Input")
            self._input = input
            self._parallelism_level = parallelism_level

        @staticmethod
        def worker():
            """worker function"""
            print 'Worker'
            return

        def build(self):
            rows = self._read_csv_file()
            jobs = []
            for i in range(5):
                p = multiprocessing.Process(target=Dataset.Builder.worker)
                jobs.append(p)
                p.start()

            return Dataset("", "path")

        def _read_csv_file(self):
            rows = []
            csv_file_path = self._input.schema.csv_file_path
            with open(csv_file_path, 'rb') as f:
                reader = csv.reader(f)
                try:
                    for row in reader:
                        rows.append(row)
                except csv.Error as e:
                    sys.exit('Broken line: file %s, line %d: %s' % (csv_file_path, reader.line_num, e))

            return rows


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
        print ""


class DataType:
    Image2D, Image3D, Text = range(3)


if __name__ == '__main__':
    print "main method"