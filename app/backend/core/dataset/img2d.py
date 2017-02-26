from input import *
import numpy as np
import skimage.io as skimgio
import PIL.Image
import imghdr

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO


class Img2DColumn(ComplexColumn):
    def __init__(self, name=None, pre_transforms=[], post_transforms=[], is_raw_img=False, reader=None):
        super(Img2DColumn, self).__init__(name=name, type=Column.Type.IMG_2D, ser_de=Img2DSerDe(is_raw_img), reader=reader,
                                          pre_transforms=pre_transforms, post_transforms=post_transforms)
        if reader is None:
            self._reader = Img2DReader(self)

    @property
    def schema(self):
        schema = super(Img2DColumn, self).schema
        pre_transforms = []
        for transform in self.pre_transforms:
            pre_transforms.append(transform.schema)
        schema['pre_transforms'] = pre_transforms
        post_transforms = []
        for transform in self.post_transforms:
            post_transforms.append(transform.schema)
        schema['post_transforms'] = post_transforms
        return schema

    class Builder(object):
        def __init__(self, img2d_column_config):
            self._img2d_column_config = img2d_column_config

        def build(self):
            pre_transforms = []
            post_transforms = []
            for pre_transform in self._img2d_column_config["pre_transforms"]:
                pre_transforms.append(self._build_transform(pre_transform))

            for post_transform in self._img2d_column_config["post_transforms"]:
                post_transforms.append(self._build_transform(post_transform))

            indexes = None
            if 'index' in self._img2d_column_config:
                indexes = self._img2d_column_config['index']

            img2d = Img2DColumn(str(self._img2d_column_config['name']), pre_transforms, post_transforms)
            img2d.columns_indexes = indexes
            return img2d

        @staticmethod
        def _build_transform(transform):
            transform_type = transform["type"]
            transform_params = transform["params"]
            if transform_type == ImgCropTransform.type():
                return ImgCropTransform(transform_params)
            if transform_type == ImgResizeTransform.type():
                return ImgResizeTransform(transform_params)
            if transform_type == ImgNormalizationTransform.type():
                return ImgNormalizationTransform(transform_params)
            raise TypeError("Unsupported column transform type: %s" % transform)


class ImgCropTransform(ColumnTransform):
    def __init__(self, params):
        super(ImgCropTransform, self).__init__()

    @staticmethod
    def type():
        return "imgCrop"

    def apply(self, data):
        return data


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
    @abc.abstractmethod
    def schema(self):
        return {}


class ImgNormalizationTransform(ColumnTransform):
    def __init__(self, params):
        super(ImgNormalizationTransform, self).__init__()

    @staticmethod
    def type():
        return "imgNormalization"

    def apply(self, data):
        return data

    @property
    @abc.abstractmethod
    def schema(self):
        return {}


class Img2DReader(ColumnReader):
    def __init__(self, column):
        super(Img2DReader, self).__init__(column)

    def read(self, csv_row):
        path = str(csv_row[self._column.columns_indexes[0]])
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
            if ch_num==1:
                img = img.reshape((rows, cols))
            else:
                img = img.reshape((rows, cols, ch_num))
        else:
            img = skimgio.imread(StringIO(img['data']))

        return img
