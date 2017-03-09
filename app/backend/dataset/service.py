from app.backend.core import Workspace
from app.backend.core.dataset.input import Schema


class DatasetService(object):
    def __init__(self, datasets_path):
        self._workspace = Workspace(datasets_path=datasets_path)

    def datasets_metadata(self):
        metadata = [dataset.metadata for dataset in self._workspace.datasets]
        return metadata

    def dataset_metadata(self, id):
        for dataset in self._workspace.datasets:
            if dataset.id == id:
                return dataset.metadata
        raise Exception("No dataset with such id")

    def load_csv(self, csv_file_path, header, separator, rows_num):
        schema = Schema(csv_file_path, header, separator)
        return schema.read_n_rows(rows_num)