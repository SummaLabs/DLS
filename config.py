import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    DEBUG = True
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'
    #
    DLS_FILEMANAGER_BASE_PATH = os.path.join(basedir, 'data-test')
    # Allowed waiting interval for job in queue to be run, seconds
    MISFIRE_GRACE_TIME = 3600
    # seconds
    JOB_MONITOR_INTERVAL = 2
    # number of threads per executor in APScheduler
    EXECUTOR_THREADS_NUMBER = 5
    # seconds
    SYSTEM_MONITOR_INTERVAL = 2
    # directory for application logs
    LOG_DIR = "logs"
    # directory for task logs
    LOG_DIR_TASK = "logs/tasks"
    # Allowed file extensions for File Manager uploading
    ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'json', 'xml', 'zip'])
    # Cuda Version
    CUDA_VERSION = "7.5"

    DLS_MODELS_BASE_PATH = models_dir = os.path.join(basedir, 'data/model')

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True