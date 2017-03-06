import shutil, tempfile
import numpy as np
from os import path
from skimage import data
import skimage.io as skimgio
import imghdr
from PIL import Image
from img2d import Img2DColumn, Img2DSerDe, Img2DColumnMetadata, Img2DReader, ImgNormalizationTransform
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

    def test_img2d_ser_de_is_raw_img_true(self):
        img2d_col = Img2DColumn(columns_indexes=[0], pre_transforms=[], post_transforms=[], is_raw_img=True)
        reader = img2d_col.reader
        ser_de = img2d_col.ser_de
        img = reader.read([self.test_img_file_path])
        img_s = ser_de.serialize(img)
        img_d = ser_de.deserialize(img_s)
        self.assertTrue(np.array_equal(img[0], img_d))

    def test_img2d_ser_de_is_raw_img_false(self):
        img2d_col = Img2DColumn(columns_indexes=[0], pre_transforms=[], post_transforms=[], is_raw_img=False)
        reader = img2d_col.reader
        ser_de = img2d_col.ser_de
        img = reader.read([self.test_img_file_path])
        img_s = ser_de.serialize(img)
        img_d = ser_de.deserialize(img_s)
        self.assertTrue(np.array_equal(img[0], img_d))


# class TestImg2DMetadata(unittest.TestCase):
#     def setUp(self):
#         self.test_dir,  self.test_img_file_path = create_test_data()
#
#     def tearDown(self):
#         shutil.rmtree(self.test_dir)
#
#     def test_img2d_metadata_aggregate(self):
#         img2d_col = Img2DColumn(columns_indexes=[0], pre_transforms=[], post_transforms=[])
#         aggregated_metadata = []
#         for i in range(1, 5):
#             img = img2d_col.reader.read([self.test_img_file_path])
#             metadata = Img2DColumnMetadata()
#             metadata.aggregate(img=img)
#             aggregated_metadata.append(metadata)
#         img2d_col.metadata.merge(aggregated_metadata)
#         mean_img = img2d_col.metadata.img
#         original_img = img2d_col.reader.read([self.test_img_file_path])[0]
#         # Should be equal because we are using the same image
#         self.assertTrue(np.array_equal(mean_img, original_img))
#
#
# class TestImg2DImgNormalizationTransform(unittest.TestCase):
#     def setUp(self):
#         self.test_dir,  self.test_img_file_path = create_test_data()
#
#     def tearDown(self):
#         shutil.rmtree(self.test_dir)
#
#     def test_img2d_normalization(self):
#         img_data = skimgio.imread(self.test_img_file_path)
#         img_fmt = imghdr.what(self.test_img_file_path)
#         data = img_data, img_fmt
#         transform = ImgNormalizationTransform(True)
#         tr_data = transform.apply(data)
#         self.assertTrue(np.array_equal(data[0], tr_data[0]))

if __name__ == '__main__':
    unittest.main()