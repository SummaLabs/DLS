class Model(object):
    def __init__(self, workspace, path):
        self.workspace = workspace
        self._load_metadata(path)

    def _load_metadata(self, path):
        print "Load Model from Path" + path