import os

from app.backend.task.task import Task
from app.backend.core.dataset.dataset import Dataset
from app.backend.core.dataset.input import Input
from app.backend.api import app_flask


class BuildDatasetTask(Task):

    def __init__(self, params):
        Task.__init__(self)
        self.params = params
        self.type = 'build_dataset'
        self.basetype = 'dataset'
        self.icon = "/frontend/assets/icon/img/img-dataset1.png"

    def perform(self):
        fm_base_dir = app_flask.config['DLS_FILEMANAGER_BASE_PATH']
        if "csv_file_path" in self.params:
            self.params["csv_file_path"] = os.path.join(fm_base_dir, self.params["csv_file_path"].strip("/"))
        if "train_csv_file_path" in self.params:
            self.params["train_csv_file_path"] = os.path.join(fm_base_dir, self.params["train_csv_file_path"].strip("/"))
        if "validation_scv_file_path" in self.params:
            self.params["validation_scv_file_path"] = os.path.join(fm_base_dir, self.params["validation_scv_file_path"].strip("/"))

        input = Input.from_schema(schema=self.params)
        dataset = Dataset.Builder(input=input,
                                  name=self.params['name'],
                                  root_dir=app_flask.config['DATASETS_BASE_PATH'],
                                  test_dataset_percentage=self.params["test_dataset_percentage"],
                                  parallelism_level=self.params['parallelism_level']).build(self)
        if self.state == 'running':
            self.state = 'finished'


