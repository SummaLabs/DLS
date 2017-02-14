from input import *


class Img2DColumn(ComplexColumn):

    def __init__(self, pre_transforms, post_transforms, reader=None):
        super(Img2DColumn, self).__init__(data_type=Img2DColumn.type, pre_transforms=pre_transforms,
                                          post_transforms=post_transforms, reader=reader)
        if reader is None:
            self._reader = Img2DReader()

    @staticmethod
    def type():
        return 'IMG_2D'

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

            return Img2DColumn(pre_transforms, post_transforms)

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


class ImgNormalizationTransform(ColumnTransform):
    def __init__(self, params):
        super(ImgNormalizationTransform, self).__init__()

    @staticmethod
    def type():
        return "imgNormalization"

    def apply(self, data):
        return data


class Img2DReader(ColumnReader):
    def __init__(self):
        super(Img2DReader, self).__init__()

    def read(self, path):
        return


class Img2DSerDe(ColumnSerDe):
    def __init__(self):
        super(Img2DSerDe, self).__init__()

    def serialize(self, path):
        return

    def deserialize(self, path):
        return
