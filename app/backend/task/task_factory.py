from app.backend.task.default_task import DefaultTask, CmdTask
from app.backend.task.roc_analysis_task import ROCAnalysisTask

from task_db_image2d_cls import TaskDBImage2DBuilder
from task_model_image2d_cls import TaskModelTeainImage2DCls


class TaskFactory:
    def __init__(self): pass

    @staticmethod
    def create(type, params):
        if type == "default":
            return DefaultTask()
        elif type == "cmd":
            return CmdTask(params['command'])
        elif type == "roc-analysis":
            return ROCAnalysisTask(params['model_id'], params['data_set_id'])
        elif type == "db-image2d-cls":
            return TaskDBImage2DBuilder(params)
        elif type == 'model-train-image2d-cls':
            return TaskModelTeainImage2DCls(params)
        else:
            return NotImplemented