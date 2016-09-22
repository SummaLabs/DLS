import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    DEBUG = True
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'
    #
    DLS_FILEMANAGER_BASE_PATH = os.path.join(basedir, 'data-test')
    DLS_MODELS_BASE_PATH = models_dir = os.path.join(basedir, 'data/model')

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True