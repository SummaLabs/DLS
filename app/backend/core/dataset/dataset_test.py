import shutil, tempfile
from os import path
from skimage import data
from PIL import Image
from input import Input, Schema
from img2d import Img2DColumn
from dataset import Dataset
import unittest
import random

test_csv_file = 'test.csv'
test_img_file = 'test-img.png'


def create_test_data(records_number):
    test_dir = tempfile.mkdtemp()
    test_csv_file_path = path.join(test_dir, test_csv_file)
    # Create and save image
    image = data.camera()
    img = Image.fromarray(image)
    test_img_file_path = path.join(test_dir, test_img_file)
    img.save(test_img_file_path)
    categories = ['cat_1', 'cat_2', 'cat_3', 'cat_4']
    f = open(test_csv_file_path, 'w')
    for i in range(records_number):
        f.write('%s, %d, %d, %d, %d, %s\n' % (categories[random.randrange(4)], i, i, i, i, test_img_file_path))
    f.close()
    return test_dir, test_csv_file_path


class TestDataSetBuilder(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path = create_test_data(10)

    def tearDown(self):
        shutil.rmtree(self.test_dir)
    #
    # def test_process_csv_file(self):
    #     schema = Schema(self.test_file_path)
    #     input = Input(schema)
    #     input.add_categorical_column('col_0')
    #     raws = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2)._process_csv_file()
    #     self.assertEqual(len(raws), 10)
    #     _, column = input._find_column_in_schema('col_0')
    #     self.assertTrue(len(column.metadata), 4)
    #
    # def test_build_dataset(self):
    #     schema = Schema(self.test_file_path)
    #     input = Input(schema)
    #     img2d = Img2DColumn([], [])
    #     input.add_column("col_5", img2d)
    #     dataset = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2).build()
        # self.assertEqual(dataset, 1000)

    def test_read_dataset(self):
        # Build dataset
        schema = Schema(self.test_file_path)
        input = Input(schema)
        img2d = Img2DColumn([], [])
        input.add_column("col_5", img2d)
        dataset = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2).build()
        data = dataset.get_batch(5)
        print data['col_1']
        # self.assertEqual(dataset, 1000)


if __name__ == '__main__':
    unittest.main()