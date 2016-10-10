import abc
from abc import abstractmethod
from datetime import datetime
import logging
import time
from app.backend import config


class Task:
    __metaclass__ = abc.ABCMeta

    """Base task class.
    Extend this class if you need custom task behaviour"""

    alive = True

    def __init__(self):
        self.alive = True
        self.process = None

        # Information parameters for tracking task on UI
        self.id = int(round(time.time() * 1000))
        self.progress = 0
        self.state = 'ready'
        self.text = 'base task'
        self.type = 'base'
        self.basetype = 'base'
        self.rows = []
        self.logger = self.init_logger()
        self.logger.info('task ' + str(self.id) + ' created')

    def execute(self):
        self.state = 'running'
        self.logger.info('starting task ' + str(self.id))
        try:
            self.perform()
        except IOError:
            print "interrupted"

    @abstractmethod
    def perform(self):
        """This method does task's work.
        Override it in your custom task class"""
        self.logger.info('Base Perform Method: %s' % datetime.now())
        self.state = 'finished'

    def kill(self):
        if self.state == 'killed':
            self.logger.warning("Attempt to kill dead task. Task " + str(self.id) + " is already killed")
        self.alive = False
        self.state = 'killed'
        self.logger.info('task ' + str(self.id) + 'killed')

    def status(self):
        stt = {}
        stt['id'] = self.id
        stt['progress'] = self.progress
        stt['text'] = self.text
        stt['type'] = self.type
        stt['basetype'] = self.basetype
        #stt['rows'] = self.rows
        stt['state'] = self.state
        return stt

    def detailed_status(self):
        stt = self.status()
        stt['rows'] = self.rows
        return stt

    def init_logger(self):
        logger = logging.getLogger('task_' + str(self.id))
        logger.setLevel(logging.DEBUG)
        fh = logging.FileHandler(config.LOG_DIR_TASK + '/task_' + str(self.id) + '.log')
        fh.setLevel(logging.DEBUG)
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)
        logger.addHandler(fh)
        #logger.addHandler(ch)
        return logger

