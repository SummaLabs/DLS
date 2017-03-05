from app.backend.task.default_task import DefaultTask, CmdTask
from app.backend.task.roc_analysis_task import ROCAnalysisTask
from app.backend.task.build_dataset_task import BuildDatasetTask

from task_db_image2d_cls import TaskDBImage2DBuilder
from task_model_image2d_cls import TaskModelTrainImage2DCls
from task_roc_image2d_cls import TaskROCImage2DCls
from task_feature_visualization_image2d import  TaskFeatureSpaceVisImage2D


class TaskFactory:
    def __init__(self): pass

    @staticmethod
    def create(type, params, body):
        if type == "default":
            return DefaultTask()
        elif type == "cmd":
            return CmdTask(params['command'])
        elif type == "roc-analysis":
            return ROCAnalysisTask(params['model_id'], params['data_set_id'])
        elif type == "db-image2d-cls":
            return TaskDBImage2DBuilder(params)
        elif type == 'model-train-image2d-cls':
            return TaskModelTrainImage2DCls(params)
        elif type == 'roc-image2d-cls':
            return TaskROCImage2DCls(params)
        elif type == 'fspace-image2d':
            return TaskFeatureSpaceVisImage2D(params)
        elif type == 'build_dataset':
            return BuildDatasetTask(body)
        else:
            return NotImplemented