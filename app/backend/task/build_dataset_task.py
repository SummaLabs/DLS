from app.backend.task.task import Task
from app.backend.core.dataset.dataset import Dataset
from app.backend.core.dataset.input import Input


class BuildDatasetTask(Task):

    def __init__(self, schema):
        Task.__init__(self)
        self.schema = schema
        self.test_dir = '/tmp/tmp37_dAG'
        self.type = 'build_dataset'
        self.basetype = 'dataset'
        self.icon = "/frontend/assets/icon/img/img-dataset1.png"


    def perform(self):
        input = Input.from_schema(self.schema)
        dataset = Dataset.Builder(input, "test", self.test_dir, parallelism_level=2).build(self)
        if self.state == 'running':
            self.state = 'finished'


