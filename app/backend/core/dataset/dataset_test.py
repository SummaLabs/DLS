import shutil, tempfile
from os import path
from input import Input, Schema
from img2d import Img2DColumn
from dataset import Dataset
import unittest
import random



def create_csv_file(file_name, records_number):
    test_dir = tempfile.mkdtemp()
    test_file_path = path.join(test_dir, file_name)
    value = "x" * 100
    categories = ['cat_1', 'cat_2', 'cat_3', 'cat_4']
    f = open(test_file_path, 'w')
    for i in range(records_number):
        f.write('col_0_%s, col_1_%d, col_2_%d, col_3_%d, col_4_%d, col_5_%s\n' % (categories[random.randrange(4)], i, i, i, i, value))
    f.close()
    return test_dir, test_file_path


class TestDataSetBuilder(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path = create_csv_file('test.csv', 1000)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_process_csv_file(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        input.add_categorical_column('col_0')
        raws = Dataset.Builder(input=input, parallelism_level=2)._process_csv_file()
        self.assertEqual(len(raws), 1000)
        _, column = input._find_column_in_schema('col_0')
        self.assertTrue(len(column.metadata), 4)


    def test_build_dataset(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        img2d = Img2DColumn([], [])
        input.add_column("col_5", img2d)
        dataset = Dataset.Builder(input=input, parallelism_level=2).build()
        self.assertEqual(dataset, 1000)


if __name__ == '__main__':
    unittest.main()