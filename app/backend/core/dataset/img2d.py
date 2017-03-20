from input import *
import numpy as np
from os import path
import skimage.io as skimgio
import PIL.Image
from PIL import Image
import imghdr
import random
import skimage as sk
import skimage.transform as sktf
from skimage.transform import SimilarityTransform
from skimage.transform import warp as skwarp
from img2d_utils import ImageTransformer2D

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO


class Img2DColumn(ComplexColumn):
    def __init__(self, name=None, columns_indexes=None, pre_transforms=[], post_transforms=[], is_raw_img=False,
                 is_related_path=False, reader=None, metadata=None):
        super(Img2DColumn, self).__init__(name=name,
                                          type=Column.Type.IMG_2D,
                                          columns_indexes=columns_indexes,
                                          ser_de=Img2DSerDe(is_raw_img),
                                          reader=reader,
                                          metadata=metadata,
                                          pre_transforms=pre_transforms,
                                          post_transforms=post_transforms)
        if reader is None:
            self._reader = Img2DReader(self, is_related_path)

        if metadata is None:
            self._metadata = Img2DColumnMetadata(self._name)

    def csv_file_path(self, csv_file_path):
        self._reader.csv_file_path(csv_file_path)

    def process_on_write(self, record):
        img_array, img_fmt = self.reader.read(record)
        if self._metadata is not None:
            self._metadata.aggregate(img_array)
        for transform in self._pre_transforms:
            img_array = transform.apply(img_array)
        return self.ser_de.serialize((img_array, img_fmt))

    @classmethod
    def from_schema(cls, column_schema):
        pre_transforms = []
        post_transforms = []
        for pre_transform in column_schema["pre_transforms"]:
            pre_transforms.append(cls._build_transform(pre_transform))
        for post_transform in column_schema["post_transforms"]:
            post_transforms.append(cls._build_transform(post_transform))
        indexes = None
        if 'index' in column_schema:
            indexes = column_schema['index']
        metadata = Img2DColumnMetadata.deserialize(column_schema['metadata'])
        img2d = Img2DColumn(name=str(column_schema['name']), columns_indexes=indexes, pre_transforms=pre_transforms,
                            post_transforms=post_transforms, metadata=metadata)
        return img2d

    @staticmethod
    def _build_transform(transform):
        type = transform["type"]
        params = transform["params"]
        if type == ImgCropTransform.type():
            return ImgCropTransform.from_params(params)
        if type == ImgResizeTransform.type():
            return ImgResizeTransform(params)
        if type == ImgNormalizationTransform.type():
            return ImgNormalizationTransform.from_params(params)
        raise TypeError("Unsupported column transform type: %s" % transform)


class ImgCropTransform(ColumnTransform):
    def __init__(self, shape):
        super(ImgCropTransform, self).__init__()
        self._out_shape = shape

    @staticmethod
    def type():
        return "imgCrop"

    def apply(self, img):
        return crop_image(img, self._out_shape)

    @staticmethod
    def from_params(params):
        return ImgCropTransform((int(params['height']), int(params['width'])))

    @property
    def serialize(self):
        return {"type": ImgCropTransform.type(), "params": {"height": self._out_shape[0], "width": self._out_shape[1]}}


class ImgResizeTransform(ColumnTransform):
    def __init__(self, params):
        super(ImgResizeTransform, self).__init__()

    @staticmethod
    def type():
        return "imgResize"

    def apply(self, data):
        return data

    @staticmethod
    def config():
        return {'type': 'input'}

    @property
    def serialize(self):
        return {}


class ImgNormalizationTransform(ColumnTransform):
    def __init__(self, is_global, mean=None, std=None):
        super(ImgNormalizationTransform, self).__init__()
        self._is_global = is_global
        if self._is_global:
            self._mean = mean
            self._std = std
        else:
            self._mean = 0.
            self._std = 1.

    @staticmethod
    def type():
        return "imgNormalization"

    def apply(self, data):
        if self._is_global:
            return (data - self._mean) / data.std
        else:
            mean = data.mean()
            std = data.std()
            return (data - mean) / std

    @property
    def serialize(self):
        params = {"is_global": self._is_global, "mean": self._mean, "std": self._std}
        return {"type": ImgCropTransform.type(), "params": params}

    @staticmethod
    def from_params(params):
        is_global = True if params['is_global'] == "True" else False
        mean = None
        std = None
        if is_global:
            mean = float(params['mean'])
            std = float(params['std'])
        return ImgNormalizationTransform(is_global, mean, std)


class Img2DReader(ColumnReader):
    def __init__(self, column, is_related_path=False):
        super(Img2DReader, self).__init__(column)
        self._is_related_path = is_related_path
        self._data_path = None

    def csv_file_path(self, data_path):
        self._data_path = data_path

    def read(self, csv_row):
        path = str(csv_row[self._column.columns_indexes[0]])
        if self._is_related_path:
            path = os.path.join(self._data_path, path)
        img_data = skimgio.imread(path)
        img_fmt = imghdr.what(path)
        return img_data, img_fmt


class Img2DSerDe(ColumnSerDe):
    def __init__(self, is_raw_img):
        self._is_raw_img = is_raw_img

    def serialize(self, img):
        img_data = img[0]
        img_fmt = img[1]
        img_ser = {}
        if self._is_raw_img:
            img_ser['rows'] = img_data.shape[0]
            img_ser['cols'] = img_data.shape[1]
            img_ser['ch_num'] = 1
            if len(img_data.shape) > 2:
                img_ser['ch_num'] = img_data.shape[2]
            img_ser['data'] = img_data.tostring()
        else:
            img_array = PIL.Image.fromarray(img_data.astype(np.uint8))
            img_buffer = StringIO()
            img_array.save(img_buffer, format=img_fmt)
            img_ser['data'] = img_buffer.getvalue()

        return img_ser

    def deserialize(self, img):
        if 'cols' in img:
            rows = img['rows']
            cols = img['cols']
            ch_num = img['ch_num']
            img = np.frombuffer(img['data'], dtype=np.uint8)
            if ch_num == 1:
                img = img.reshape((rows, cols))
            else:
                img = img.reshape((rows, cols, ch_num))
        else:
            img = skimgio.imread(StringIO(img['data']))

        return img


class Img2DColumnMetadata(ColumnMetadata):
    def __init__(self, column_name=None):
        self._column_name = column_name
        self._path = None
        self._img = None
        self._img_num = 0

    @property
    def img(self):
        return self._img

    @img.setter
    def img(self, img):
        self._img = img

    @property
    def img_num(self):
        return self._img_num

    def aggregate(self, img):
        img = img.astype(np.float)
        if self._img is None:
            self._img = img
        else:
            self._img += img
        self._img_num += 1

    def merge(self, agg_metadata):
        for metadata in agg_metadata:
            if self._img is None:
                self._img = metadata.img
            else:
                self._img += metadata.img
            self._img_num = self._img_num + metadata.img_num
        self._img = self._img / self._img_num

    def path(self, path):
        self._path = path

    def serialize(self):
        img = Image.fromarray(np.uint8(self._img)).convert('RGB')
        img_path_prefix = self._column_name
        if self._column_name is not None:
            img_path_prefix = str(random.getrandbits(16))
        mean_img_path = path.join(self._path, img_path_prefix + '-mean-img.jpg')
        img.save(mean_img_path)
        return {'mean-img-path': mean_img_path}

    @classmethod
    def deserialize(cls, schema):
        mean_img_path = path.join(schema['mean-img-path'])
        img = skimgio.imread(mean_img_path)
        metadata = Img2DColumnMetadata()
        metadata.img = img
        return metadata


# Util methods for img2d

def squash_image(img, output_shape):
    return sktf.resize(img, output_shape=output_shape)


def fill_image(img, output_shape):
    n_rows = img.shape[0]
    n_cols = img.shape[1]
    if n_rows == output_shape[0] and n_cols == output_shape[1]:
        return img.copy()
    size_out = float(output_shape[0]) / float(output_shape[1])
    size_in = float(n_rows) / float(n_cols)
    if size_out > size_in:
        new_shape = (int(n_rows * float(output_shape[1]) / n_cols), output_shape[1])
    else:
        new_shape = (output_shape[0], int(n_cols * float(output_shape[0]) / n_rows))
    timg = sktf.resize(img, new_shape, preserve_range=True)
    timgShape = timg.shape[:2]
    nch = 1 if timg.ndim < 3 else timg.shape[-1]
    p0 = (int((output_shape[0] - timgShape[0]) / 2.), int((output_shape[1] - timgShape[1]) / 2.))
    if nch == 1:
        tret = np.zeros(output_shape, dtype=img.dtype)
        tret[p0[0]:p0[0] + timg.shape[0], p0[1]:p0[1] + timg.shape[1]] = timg
    else:
        tret = np.zeros((output_shape[0], output_shape[1], nch), dtype=img.dtype)
        tret[p0[0]:p0[0] + timg.shape[0], p0[1]:p0[1] + timg.shape[1], :] = timg
    return tret


def crop_image(img, output_shape):
    # TODO: check performance: code is realy clean, but...
    size_in = (img.shape[1], img.shape[0])
    size_out = (output_shape[1], output_shape[0])
    transform = SimilarityTransform(translation=(-0.5 * (size_out[0] - size_in[0]), -0.5 * (size_out[1] - size_in[1])))
    return skwarp(img, transform, output_shape=output_shape)
