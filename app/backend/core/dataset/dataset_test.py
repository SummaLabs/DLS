import shutil, tempfile
from os import path
from input import Input, Schema
from img2d import Img2DColumn
import unittest


def create_csv_file(file_name):
    test_dir = tempfile.mkdtemp()
    test_file_path = path.join(test_dir, file_name)
    f = open(test_file_path, 'w')
    for i in range(15):
        f.write('col1%d, col2%d, col3%d, col4%d, col5%d, col6%d\n' % (i, i, i, i, i, i))
    f.close()
    return test_dir, test_file_path


class TestDatasetBuilder(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path = create_csv_file('test.csv')

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_read_csv_file(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        img2d = Img2DColumn([], [])
        input.add_column("col_0", img2d)
