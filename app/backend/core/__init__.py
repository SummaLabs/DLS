import os

from app.backend.core.dataset.dataset import Dataset


class Workspace(object):

    def __init__(self, datasets_path=None, models_path=None):
        self.datasets_path = datasets_path
        self.models_path = models_path

    def _load_datasets(self, datasets_path):
        datasets = []
        for dataset_path in os.listdir(datasets_path):
            datasets.append(Dataset.load(dataset_path))
        return datasets

    def _load_models(self, models_path):
        print "User Datasets"

    @property
    def datasets(self):
        return self._load_datasets(self.datasets_path)

    def models(self):
        self._load_models(self.models_path)
