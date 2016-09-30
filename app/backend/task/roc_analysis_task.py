from app.backend.task.task import Task
import time


class ROCAnalysisTask(Task):

    def __init__(self, model_id, data_set_id):
        Task.__init__(self)
        self.alive = True
        self.process = None

        self.id = int(round(time.time() * 1000))
        self.progress = 0
        self.state = 'ready'
        self.text = 'ROC Analysis'
        self.type = 'roc-analysis'
        self.rows = []
        self.logger = self.init_logger()
        self.logger.info('task ' + str(self.id) + ' created')

        self.model_id = model_id
        self.data_set_id = data_set_id

    def perform(self):
        from datetime import datetime
        self.logger.info('Base Perform Method: %s' % datetime.now())
        import time
        time.sleep(3)
        self.state = 'finished'

    def kill(self):
        pass
