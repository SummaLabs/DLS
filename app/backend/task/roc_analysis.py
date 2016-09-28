from app.backend.task.task import Task


class ROCAnalysis(Task):

    def __init__(self, model_id, data_set_id):
        Task.__init__(self)
        self.model_id = model_id
        self.data_set_id = data_set_id

    def perform(self):
        pass

    def kill(self):
        pass
