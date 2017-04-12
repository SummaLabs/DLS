from app.backend.core import Workspace
from app.backend.core.dataset.dataset import HDF5RecordReader
from app.backend.core.dataset.input import Schema, Column
import numpy as np
import base64
from PIL import Image
from cStringIO import StringIO


class DatasetService(object):
    def __init__(self, datasets_path):
        self._workspace = Workspace(datasets_path=datasets_path)

    def datasets_metadata(self):
        metadata = [dataset.metadata for dataset in self._workspace.datasets]
        return metadata

    def dataset_metadata(self, id):
        dataset = self._workspace.dataset(id)
        return None if dataset is None else dataset.metadata

    def load_records_for_preview(self, dataset_id, start, end):
        dataset = self._workspace.dataset(dataset_id)
        preview_records = []
        for index in range(start, end):
            record = dataset.read_record(index)
            preview_record = []
            for index, column in enumerate(dataset._input.columns):
                if column.type == Column.Type.IMG_2D:
                    image = Image.fromarray(record[index])
                    buffer = StringIO()
                    image.save(buffer, format='JPEG')
                    preview_record.append('data:image/jpg;base64,' + base64.b64encode(buffer.getvalue()))
                elif column.type == Column.Type.VECTOR:
                    preview_record.append(np.asarray(record[index]))
                else:
                    preview_record.append(record[index])
            preview_records.append(preview_record)
        return preview_records

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
    def load_from_csv(csv_file_path, separator, rows_num):
        return Schema.read_n_rows(csv_file_path=csv_file_path, delimiter=separator, rows_number=rows_num)
