from app.backend.task.task import Task
from app.backend.core.dataset.dataset import Dataset
from app.backend.core.dataset.input import Input


class BuildDatasetTask(Task):

    def __init__(self, json):
        Task.__init__(self)
        self.schema = json['schema']
        self.parallelism_level = json['parallelism_level']
        self.test_dir =  json['test_dir'] #'/tmp/tmp37_dAG'
        self.type = 'build_dataset'
        self.basetype = 'dataset'
        self.icon = "/frontend/assets/icon/img/img-dataset1.png"


    def perform(self):
        input = Input.Builder(self.schema).build()
        dataset = Dataset.Builder(input, "test", self.test_dir, self.parallelism_level).build(self)
        if self.state == 'running':
            self.state = 'finished'


