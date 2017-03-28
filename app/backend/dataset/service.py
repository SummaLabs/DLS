from app.backend.core import Workspace
from app.backend.core.dataset.dataset import HDF5RecordReader
from app.backend.core.dataset.input import Schema, Column


class DatasetService(object):
    def __init__(self, datasets_path):
        self._workspace = Workspace(datasets_path=datasets_path)

    def datasets_metadata(self):
        metadata = [dataset.metadata for dataset in self._workspace.datasets]
        return metadata

    def dataset_metadata(self, id):
        dataset = self._workspace.dataset(id)
        return None if dataset is None else dataset.metadata

    def load_records(self, dataset_id, start, end):
        dataset = self._workspace.dataset(dataset_id)
        record_reader = HDF5RecordReader(dataset.path)
        records = []
        for i in range(start, end):
            records.append(record_reader.read(i))
        return records


    @staticmethod
    def data_types_config():
        return {"column": [
            {
                "type": Column.Type.NUMERIC
            },
            {
                "type": Column.Type.CATEGORICAL
            },
            {
                "type": Column.Type.VECTOR
            },
            {
                "type": Column.Type.IMG_2D,
                "transforms": [{"type": "img-resize", "name": "Image Resize", "config": {"height": {"input": "int"}, "width": {"input":"int"}}},
                               {"type": "img-normalization", "name": "Image Normalization", "config": {"height": {"input": "int"}, "width": {"input":"int"}}},
                               {"type": "img-Cropping", "name": "Image Cropping", "config": {"height": {"input": "int"}, "width": {"input":"int"}}}]
            }
        ]}

    @staticmethod
    def load_from_csv(csv_file_path, header, separator, rows_num):
        return Schema.read_n_rows(csv_file_path=csv_file_path, delimiter=separator, rows_number=rows_num)
