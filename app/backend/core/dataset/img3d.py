from input import *
import numpy as np
import skimage.io as skimgio
import PIL.Image
import imghdr
import nibabel


class Img3DColumn(ComplexColumn):
    def __init__(self, name=None, pre_transforms=[], post_transforms=[], is_raw_blob=False, reader=None):
        super(Img3DColumn, self).__init__(name=name, type=Column.Type.IMG_3D, ser_de=Img3DSerDe(), reader=reader,
                                          pre_transforms=pre_transforms, post_transforms=post_transforms)
        if reader is None:
            self._reader = Img3DReader(is_raw_blob, self)

    @property
    def schema(self):
        schema = super(Img3DColumn, self).schema
        # FIXME: move to parent class??
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
        def __init__(self, img3d_column_config):
            self._img3d_column_config = img3d_column_config

        def build(self):
            pre_transforms = []
            post_transforms = []
            for pre_transform in self._img3d_column_config["pre_transforms"]:
                pre_transforms.append(self._build_transform(pre_transform))

            for post_transform in self._img3d_column_config["post_transforms"]:
                post_transforms.append(self._build_transform(post_transform))

            indexes = None
            if 'index' in self._img3d_column_config:
                indexes = self._img3d_column_config['index']

            img3d = Img3DColumn(str(self._img3d_column_config['name']), pre_transforms, post_transforms)
            img3d.columns_indexes = indexes
            return img3d

        @staticmethod
        def _build_transform(transform):
            transform_type = transform["type"]
            transform_params = transform["params"]
            if transform_type == Img3DCropTransform.type():
                return Img3DCropTransform(transform_params)
            if transform_type == Img3DResizeTransform.type():
                return Img3DResizeTransform(transform_params)
            if transform_type == Img3DNormalizationTransform.type():
                return Img3DNormalizationTransform(transform_params)
            raise TypeError("Unsupported column transform type: %s" % transform)


class Img3DCropTransform(ColumnTransform):
    def __init__(self, params):
        super(Img3DCropTransform, self).__init__()

    @staticmethod
    def type():
        return "imgCrop"

    def apply(self, data):
        return data


class Img3DResizeTransform(ColumnTransform):
    def __init__(self, params):
        super(Img3DResizeTransform, self).__init__()

    @staticmethod
    def type():
        return "imgResize"

    def apply(self, data):
        return data

    @staticmethod
    def config():
        return {'type': 'input'}

    @property
    def schema(self):
        return {}


class Img3DNormalizationTransform(ColumnTransform):
    def __init__(self, params):
        super(Img3DNormalizationTransform, self).__init__()

    @staticmethod
    def type():
        return "imgNormalization"

    def apply(self, data):
        return data

    @property
    def serialize(self):
        return {}


class Img3DReader(ColumnReader):
    def __init__(self, is_raw_blob, column):
        super(Img3DReader, self).__init__(column)
        self._is_raw_blob = is_raw_blob

    def read(self, csv_row):
        path = str(csv_row[self._column.columns_indexes[0]])
        img_data = np.void(open(path, 'r').read()) if self._is_raw_blob else nibabel.load(path).get_data()
        img_fmt = imghdr.what(path)
        return img_data, img_fmt


class Img3DSerDe(ColumnSerDe):
    def serialize(self, img):
        img_data = img[0]
        img_fmt = img[1]
        img_data_rows  = img_data.shape[0]
        img_data_cols  = img_data.shape[1]
        img_data_depth = img_data.shape[2]
        img_ch_num = 1
        if img_data.ndim > 3:
            img_ch_num = img_data.shape[-1]
        return {
            'rows': int(img_data_rows),
            'cols': int(img_data_cols),
            'depth': int(img_data_depth),
            'ch_num': int(img_ch_num),
            'fmt': str(img_fmt),
            'data': img_data
        }

    def deserialize(self, img):
        # What do we need with metadata???
        img_data = img['data'].value
        return img_data.ravel()
