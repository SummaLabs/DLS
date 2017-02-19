import shutil, tempfile
from os import path
from skimage import data
from PIL import Image
from img2d import Img2DColumn, Img2DSerDe
import unittest
import random

test_csv_file = 'test.csv'
test_img_file = 'test-img.png'


def create_test_data():
    test_dir = tempfile.mkdtemp()
    # Create and save image
    image = data.camera()
    img = Image.fromarray(image)
    test_img_file_path = path.join(test_dir, test_img_file)
    img.save(test_img_file_path)

    return test_dir, test_img_file_path


class TestImg2DSerDe(unittest.TestCase):
    def setUp(self):
        self.test_dir,  self.test_img_file_path = create_test_data()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_img2d_ser_de_serialize(self):
        img2d_col = Img2DColumn([], [], is_raw_blob=False)
        img2d_col.columns_indexes = [0]
        reader = img2d_col.reader
        serializer = img2d_col.ser_de
        img = reader.read([self.test_img_file_path])
        ser_img = serializer.serialize(img)
        self.assertEqual(ser_img['rows'], 512)
        self.assertEqual(ser_img['cols'], 512)
        self.assertEqual(ser_img['ch_num'], 1)
        self.assertEqual(ser_img['fmt'], 'png')


if __name__ == '__main__':
    unittest.main()