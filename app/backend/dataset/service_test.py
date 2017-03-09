import shutil, tempfile
from os import path
import unittest
from skimage import data
import PIL.Image
from PIL import Image

from app.backend.dataset.service import DatasetService


test_img_file = 'test-img.png'


def create_csv_file(file_name):
    test_dir = tempfile.mkdtemp()
    test_file_path = path.join(test_dir, file_name)
    # Create and save image
    image = data.camera()
    img = Image.fromarray(image)
    test_img_file_path = path.join(test_dir, test_img_file)
    img.save(test_img_file_path)
    f = open(test_file_path, 'w')
    for i in range(15):
        f.write('col1%d, col2%d, col3%d, col4%d, col5%d, col6%d\n' % (i, i, i, i, i, i))
    f.close()
    return test_dir, test_file_path, test_img_file_path


class TestSchema(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path, self.test_img_file_path = create_csv_file('test.csv')

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_load_from_csv(self):
        dataset_service = DatasetService("test")
        rows = dataset_service.load_from_csv(self.test_file_path, False, ',', 10)
        self.assertEqual(len(rows), 10)


if __name__ == '__main__':
    unittest.main()