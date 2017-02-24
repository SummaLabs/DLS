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

    def test_process_csv_file(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        input.add_categorical_column('col_0')
        rows = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2)._process_csv_file()
        self.assertEqual(len(rows), 10)
        _, column = input._find_column_in_schema('col_0')
        self.assertTrue(len(column.metadata), 4)

    def test_build_dataset(self):
        schema = Schema(self.test_file_path)
        schema.merge_columns_in_range('col_vector', (2, 4))
        input = Input(schema)
        input.add_categorical_column('col_0')
        input.add_numeric_column('col_1')
        input.add_vector_column('col_vector')
        img2d = Img2DColumn([], [])
        input.add_column("col_5", img2d)
        dataset = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2).build()
        data = dataset.get_batch(5)
        categories_vector = data['col_0']
        # Check that for the same record there are the same values in vectors as we assign it in csv file
        float_vector = data['col_1']
        col_vector = data['col_vector']
        self.assertEqual(col_vector[0, 0], col_vector[0, 1])
        self.assertEqual(col_vector[0, 0], float_vector[0])
        # Load dataset
        dataset = Dataset.load(dataset._path)
        data = dataset.get_batch(5)
        # Check that for the same record there are the same values in vectors as we assign it in csv file
        float_vector = data['col_1']
        col_vector = data['col_vector']
        self.assertEqual(col_vector[0, 0], col_vector[0, 1])
        self.assertEqual(col_vector[0, 0], float_vector[0])


if __name__ == '__main__':
    unittest.main()