
class Dataset(object):
    def __init__(self, workspace, path):
        self.workspace = workspace
        self.metadata = self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Dataset from Path" + path

    def get_batch(self, batch_size):
        return Data


class Builder(object):
    def __init__(self, input, integrate_data = False):
        # if not isinstance(input, CSVInput):
        #     raise TypeError("Must be set to an CSVInput")
        pass

    def build(self):
        return Dataset


class Data(object):
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"

    def to_data_frame(self):
        raise NotImplementedError("Please Implement this method")


class Image2DData(Data):
    def __init__(self):
        print ""

    def _load_data(self):
        print "Test"


class Metadata(object):
    def __init__(self):
        print ""


class Image2DMetadata(Metadata):
    def __init__(self):
        print ""


class DataType:
    Image2D, Image3D, Text = range(3)


if __name__ == '__main__':
    print "main method"