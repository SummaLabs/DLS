import os
import re

from app.backend.core.dataset.dataset import Dataset


class Workspace(object):

    def __init__(self, datasets_path=None, models_path=None):
        self.datasets_path = datasets_path
        self.models_path = models_path

    def _load_datasets(self, ds_root_path):
        # Regex of dataset folder
        ds_dir_regex = re.compile(r'(.*)[- ](\d+)')
        ds_dirs = filter(ds_dir_regex.search, os.listdir(ds_root_path))
        datasets = []
        for ds_path in ds_dirs:
            datasets.append(Dataset.load(os.path.join(ds_root_path, ds_path)))
        return datasets

    def _load_models(self, models_path):
        print "User Datasets"

    @property
    def datasets(self):
        return self._load_datasets(self.datasets_path)

    def dataset(self, id):
        for dataset in self.datasets:
            if dataset.id == id:
                return dataset
        return None

    def models(self):
        self._load_models(self.models_path)
