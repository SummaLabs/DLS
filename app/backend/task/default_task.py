from datetime import datetime
import os
import subprocess
import random
import time
from app.backend.task.task import Task


class DefaultTask(Task):
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



class CmdTask(Task):
    """This is example of subprocess based task"""

    def __init__(self, cmd):
        Task.__init__(self)
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
