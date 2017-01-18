class Workspace(object):

    def __init__(self, datasets_path, models_path):
        self.datasets_path = datasets_path
        self.models_path = models_path

    def _load_datasets(self, datasets_path):
        print "User Datasets"

    def _load_models(self, models_path):
        print "User Datasets"

    def datasets(self):
        self._load_datasets(self.datasets_path)

    def models(self):
        self._load_models(self.models_path)
