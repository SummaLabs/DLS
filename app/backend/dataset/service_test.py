import shutil, tempfile
from os import path
import unittest

from app.backend.core.dataset.input_test import create_test_data
from app.backend.core.dataset.dataset_test import create_test_dataset
from service import DatasetService


class TestDatasetService(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 10)
        # for i in range(0, 3):
        #     create_test_dataset(self.test_dir, self.test_img_file_path, "test_dataset_" + str(i))
        create_test_dataset(self.test_dir, self.test_csv_file_path, "test_dataset_" + str(0))

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
            # columns_metadata = metadata.columns_metadata


if __name__ == '__main__':
    unittest.main()