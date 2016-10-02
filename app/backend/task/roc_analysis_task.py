import json
import os

from app.backend import app_flask
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
        self.logger.info('ROC Analysis Perform Method: %s' % datetime.now())
        import time
        time.sleep(5)
        #copy file just for test
        models_dir = app_flask.config['DLS_MODELS_BASE_PATH']
        validation_dir = os.path.join(models_dir, os.path.join(self.model_id, 'validation'))
        roc_file_path = os.listdir(validation_dir)[0]
        with open(os.path.join(validation_dir, roc_file_path), 'r') as src:
            content = json.load(src)
            content['date'] += str(self.id)
            with open(os.path.join(validation_dir, str(self.id) + "-" + roc_file_path), 'w') as out:
                out.write(json.dumps(content))

        self.state = 'finished'

    def kill(self):
        pass
