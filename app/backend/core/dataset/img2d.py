from input import *


class Img2DColumn(Input.Column):
    def __init__(self, data_type, pre_transforms, post_transforms, reader=None):
        super(Img2DColumn, self).__init__(data_type)
        self._pre_transforms = pre_transforms
        self._post_transforms = post_transforms
        self._reader = reader

    @property
    def pre_transforms(self):
        return self._pre_transforms

    @property
    def post_transforms(self):
        return self._post_transforms

    @property
    def reader(self):
        return self._reader

    class Builder(object):
        def __init__(self, schema_config):
            self._schema_config = json.load(schema_config)

        def build(self):
            pass


class CropImageTransform(ColumnTransform):
    def __init__(self):
        pass

    def apply(self, data):
        return data


class ResizeTransform(ColumnTransform):
    def __init__(self):
        pass

    def apply(self, data):
        return data


class Image2DReader(ColumnReader):
    def __init__(self):
        pass

    def read(self, path):
        return


class Image2DSerDe(ColumnSerDe):
    def __init__(self):
        pass

    def serialize(self, path):
        return

    def deserialize(self, path):
        return