class Dataset(object):
    def __init__(self, workspace, path):
        self.workspace = workspace
        self.metadata = self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Dataset from Path" + path

    def load_batch(self, batch_size):
        print ""


class DataRecord(object):
    def __init__(self):
        self.data = self._load_data()

    def _load_data(self):
        print "Test"

    def get_data_from_slot(self, slot_index):
        print ""

class Data(object):
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"

    def to_data_frame(self):
        raise NotImplementedError("Please Implement this method")


class Image2DData(Data):
    data_type = DataType.Image2D
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"


class Metadata(object):
    def __init__(self):
        print ""


class Image2DMetadata(Metadata):
    data_type = DataType.Image2D
    def __init__(self):
        print ""


class DataType:
    Image2D, Image3D, Text = range(3)