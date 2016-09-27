from datetime import datetime
import time
import os
import subprocess
import random
import logging
import time
from app.backend import config


class BaseTask:
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
        stt['rows'] = self.rows
        stt['state'] = self.state
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


class DefaultTask(BaseTask):
    """This is default example of task"""

    def perform(self):
        while self.alive:
            time.sleep(1)
            self.progress += 10
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            self.logger.info('Task. The time is: %s' % datetime.now())
            if self.progress == 100:
                self.state = 'finished'
                self.alive = False
                self.logger.info('task ' + str(self.id) + ' finished')



class CmdTask(BaseTask):
    """This is example of subprocess based task"""

    def __init__(self, cmd):
        BaseTask.__init__(self)
        self.command = cmd

    def perform(self):
        tenv = os.environ.copy()
        tenv['LC_ALL'] = "C"
        process = subprocess.Popen(self.command.split(), stdout=subprocess.PIPE, env=tenv)
        self.process = process
        stdout_lines = iter(process.stdout.readline, "")

        """This loop blocks execution.
        i. e. thread will wait next stdout lines from subprocess"""
        for stdout_line in stdout_lines:
            self.logger.info(stdout_line)
            self.progress += 1
        process.stdout.close()
        if self.state == 'running':
            self.state = 'finished'
        self.logger.info(process.returncode)

    def kill(self):
        self.process.kill()
        self.state = 'killed'
        self.logger.info('task ' + str(self.id) + 'killed')
