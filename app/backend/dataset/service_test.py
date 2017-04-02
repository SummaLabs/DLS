import shutil, tempfile
import unittest

from app.backend.core.dataset.img2d import Img2DColumnMetadata
from app.backend.core.dataset.input import CategoricalColumnMetadata
from app.backend.core.dataset.input_test import create_test_data
from app.backend.core.dataset.dataset_test import create_test_dataset
from service import DatasetService


class TestDatasetService(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 10)
        self.datasets_ids = []
        for i in range(0, 3):
            self.datasets_ids.append(create_test_dataset(self.test_dir, self.test_csv_file_path, "test_dataset_" + str(i)).id)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_load_from_csv(self):
        dataset_service = DatasetService("test")
        rows = dataset_service.load_from_csv(self.test_csv_file_path, False, ',', 10)
        self.assertEqual(len(rows), 10)

    def test_load_datasets_metadata(self):
        dataset_service = DatasetService(self.test_dir)
        datasets_metadata = dataset_service.datasets_metadata()
        for metadata in datasets_metadata:
            self.assertTrue(metadata.size > 0)
            self.assertEqual(metadata.records_count, 10)
            for column_metadata in metadata.columns_metadata:
                if isinstance(column_metadata, CategoricalColumnMetadata):
                    self.assertEqual(len(column_metadata.categories), 4)
                if isinstance(column_metadata, Img2DColumnMetadata):
                    self.assertEqual(len(column_metadata.img_num), 1)

    def test_load_dataset_metadata(self):
        dataset_service = DatasetService(self.test_dir)
        dataset_metadata = dataset_service.dataset_metadata(self.datasets_ids[0])
        self.assertTrue(dataset_metadata.size > 0)
        self.assertEqual(dataset_metadata.records_count, 10)
        for column_metadata in dataset_metadata.columns_metadata:
            if isinstance(column_metadata, CategoricalColumnMetadata):
                self.assertEqual(len(column_metadata.categories), 4)
            if isinstance(column_metadata, Img2DColumnMetadata):
                self.assertEqual(len(column_metadata.img_num), 1)

    def test_load_dataset_records(self):
        dataset_service = DatasetService(self.test_dir)
        records = dataset_service.load_records_for_preview(self.datasets_ids[0], 2, 5)
        self.assertEqual(len(records), 3)


if __name__ == '__main__':
    unittest.main()