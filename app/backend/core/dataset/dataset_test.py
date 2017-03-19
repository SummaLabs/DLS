import shutil, tempfile
import skimage.io as skimgio
from input import Input, Schema, CategoricalColumnMetadata
from img2d import Img2DColumn
from dataset import Dataset, RecordWriter, RecordReader
import unittest
import os
import numpy as np
from input_test import create_test_data
from input_test import categories


def create_test_dataset(test_dir, test_csv_file_path, dataset_name, is_related_path=False):
    schema = Schema(test_csv_file_path)
    schema.merge_columns_in_range('col_vector', (2, 4))
    input = Input(schema)
    input.add_categorical_column('col_0')
    input.add_numeric_column('col_1')
    input.add_vector_column('col_vector')
    img2d = Img2DColumn([], [], is_related_path=is_related_path)
    input.add_column("col_5", img2d)
    return Dataset.Builder(input, dataset_name, test_dir, parallelism_level=2).build()


class TestDataSetBuilder(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 10)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_process_csv_file(self):
        schema = Schema(self.test_csv_file_path)
        input = Input(schema)
        input.add_categorical_column('col_0')
        rows = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2)._process_csv_file()
        self.assertEqual(len(rows), 10)
        for column in input.columns:
            if column.name == 'col_0':
                self.assertTrue(len(column.metadata.categories), 4)

    def test_build_dataset_absolute_path(self):
        dataset = create_test_dataset(self.test_dir, self.test_csv_file_path, "test_dataset_name")
        metadata = dataset.metadata
        self.assertEqual(metadata.records_count, 10)
        self.assertTrue(metadata.size > 0)
        data = dataset.get_batch(5)
        categories_vector = data['col_0']
        # Check that for the same record there are the same values in vectors as we assign it in csv file
        float_vector = data['col_1']
        col_vector = data['col_vector']
        self.assertEqual(col_vector[0, 0], col_vector[0, 1])
        self.assertEqual(col_vector[0, 0], float_vector[0])
        # Load dataset
        dataset = Dataset.load(dataset._path)
        metadata = dataset.metadata
        self.assertEqual(metadata.records_count, 10)
        self.assertTrue(metadata.size > 0)
        data = dataset.get_batch(5)
        # Check that for the same record there are the same values in vectors as we assign it in csv file
        float_vector = data['col_1']
        col_vector = data['col_vector']
        self.assertEqual(col_vector[0, 0], col_vector[0, 1])
        self.assertEqual(col_vector[0, 0], float_vector[0])

    def test_build_dataset_related_path(self):
        test_csv_file_path, test_img_file_path = create_test_data(self.test_dir, 10, is_related_path=True)
        dataset = create_test_dataset(self.test_dir, test_csv_file_path, "test_dataset_name", is_related_path=True)
        metadata = dataset.metadata
        self.assertEqual(metadata.records_count, 10)
        self.assertTrue(metadata.size > 0)
        data = dataset.get_batch(5)
        categories_vector = data['col_0']
        # Check that for the same record there are the same values in vectors as we assign it in csv file
        float_vector = data['col_1']
        col_vector = data['col_vector']
        self.assertEqual(col_vector[0, 0], col_vector[0, 1])
        self.assertEqual(col_vector[0, 0], float_vector[0])
        # Load dataset
        dataset = Dataset.load(dataset._path)
        metadata = dataset.metadata
        self.assertEqual(metadata.records_count, 10)
        self.assertTrue(metadata.size > 0)
        data = dataset.get_batch(5)
        # Check that for the same record there are the same values in vectors as we assign it in csv file
        float_vector = data['col_1']
        col_vector = data['col_vector']
        self.assertEqual(col_vector[0, 0], col_vector[0, 1])
        self.assertEqual(col_vector[0, 0], float_vector[0])


class TestHDF5RecordWriterReader(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 10)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_write_read_record_raw_img_true(self):
        schema = Schema(self.test_csv_file_path)
        schema.merge_columns_in_range('col_vector', (2, 4))
        input = Input(schema)
        input.add_categorical_column('col_0')
        for column in input.columns:
            if column.name == 'col_0':
               metadata = CategoricalColumnMetadata()
               metadata._categories = categories
               column.metadata = metadata
        input.add_numeric_column('col_1')
        input.add_vector_column('col_vector')
        img2d = Img2DColumn(pre_transforms=[], post_transforms=[], is_raw_img=True)
        input.add_column("col_5", img2d)
        os.makedirs(os.path.join(self.test_dir, Dataset.DATA_DIR_NAME))
        record_writer = RecordWriter.factory('HDF5', self.test_dir, input.columns)
        csv_row = [ent.strip() for ent in schema.read_n_rows(1)[0]]
        precessed_row = {}
        for column in input.columns:
            precessed_row[column.name] = column.process_on_write(csv_row)
        record_writer.write(precessed_row, 0)
        record_reader = RecordReader.factory('HDF5', self.test_dir)
        record = record_reader.read(0)
        data = {}
        for column in input.columns:
            data[column.name] = column.process_on_read(record)
        img_deserialized = data['col_5']
        img_original = skimgio.imread(self.test_img_file_path)
        self.assertTrue(np.array_equal(img_deserialized, img_original))

    def test_write_read_record_raw_img_false(self):
        schema = Schema(self.test_csv_file_path)
        schema.merge_columns_in_range('col_vector', (2, 4))
        input = Input(schema)
        input.add_categorical_column('col_0')
        for column in input.columns:
            if column.name == 'col_0':
               metadata = CategoricalColumnMetadata()
               metadata._categories = categories
               column.metadata = metadata
        input.add_numeric_column('col_1')
        input.add_vector_column('col_vector')
        img2d = Img2DColumn(pre_transforms=[], post_transforms=[], is_raw_img=False)
        input.add_column("col_5", img2d)
        os.makedirs(os.path.join(self.test_dir, Dataset.DATA_DIR_NAME))
        record_writer = RecordWriter.factory('HDF5', self.test_dir, input.columns)
        csv_row = [ent.strip() for ent in schema.read_n_rows(1)[0]]
        precessed_row = {}
        for column in input.columns:
            precessed_row[column.name] = column.process_on_write(csv_row)
        record_writer.write(precessed_row, 0)
        record_reader = RecordReader.factory('HDF5', self.test_dir)
        record = record_reader.read(0)
        data = {}
        for column in input.columns:
            data[column.name] = column.process_on_read(record)
        img_deserialized = data['col_5']
        img_original = skimgio.imread(self.test_img_file_path)
        self.assertTrue(np.array_equal(img_deserialized, img_original))


if __name__ == '__main__':
    unittest.main()