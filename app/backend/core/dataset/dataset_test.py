import shutil, tempfile
from os import path
from input import Input, Schema
from img2d import Img2DColumn
from dataset import Dataset
import unittest


def create_csv_file(file_name, records_number):
    test_dir = tempfile.mkdtemp()
    test_file_path = path.join(test_dir, file_name)
    value = "x" * 100
    f = open(test_file_path, 'w')
    for i in range(records_number):
        f.write('col_0%d, col_1%d, col_2%d, col_3%d, col_4%d, col_5_%s\n' % (i, i, i, i, i, value))
    f.close()
    return test_dir, test_file_path


class TestDataSetBuilder(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path = create_csv_file('test.csv', 1000)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_read_csv_file(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        img2d = Img2DColumn([], [])
        input.add_column("col_5", img2d)
        raws = Dataset.Builder(input=input, parallelism_level=2)._read_csv_file()
        self.assertEqual(len(raws), 1000)

    def test_build_dataset(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        img2d = Img2DColumn([], [])
        input.add_column("col_5", img2d)
        dataset = Dataset.Builder(input=input, parallelism_level=2).build()
        self.assertEqual(dataset, 1000)


if __name__ == '__main__':
    unittest.main()