from app.backend.task.task import Task
from app.backend.core.dataset.dataset import Dataset
from app.backend.core.dataset.input import Input
from app.backend.api import app_flask


class BuildDatasetTask(Task):

    def __init__(self, params):
        Task.__init__(self)
        self.name = params['name']
        self.parallelism_level = params['parallelism_level']
        self.schema = params['schema']
        self.base_path = app_flask.config['DATASETS_BASE_PATH']
        self.type = 'build_dataset'
        self.basetype = 'dataset'
        self.icon = "/frontend/assets/icon/img/img-dataset1.png"

    def perform(self):
        input = Input.from_schema(self.schema)
        dataset = Dataset.Builder(input,
                                  self.name,
                                  app_flask.config['DATASETS_BASE_PATH'],
                                  self.parallelism_level).build(self)
        if self.state == 'running':
            self.state = 'finished'


