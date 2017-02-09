from multiprocessing import Process, Value, Lock
import numpy as np
import csv, sys
import time
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

            csv_rows_chunks = np.array_split(self._read_csv_file(), self._parallelism_level)
            processes = []
            progress = Progress()
            for i in range(self._parallelism_level):
                p = Process(target=Dataset.Builder.run, args=(csv_rows_chunks[i], self._input, progress))
                processes.append(p)
            for p in processes: p.start()
            for p in processes: p.join()

            print "Records processed: " + str(progress.value())

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

        @staticmethod
        def run(csv_rows, input, progress):
            for i, row in enumerate(csv_rows):
                # time.sleep(0.01)
                progress.increment()
                if i % 1000 == 0:
                    print "Worker - " +str(i)

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
    from input import Schema, Input, BasicTypeColumn
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