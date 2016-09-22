from datetime import datetime
import time
import os
import subprocess
import random


class BaseTask:
    """Base task class.
    Extend this class if you need custom task behaviour"""

    alive = True

    def __init__(self):
        self.alive = True
        self.process = None

        # Information parameters for tracking task on UI
        self.id = random.random()
        self.progress = 0
        self.state = 'ready'
        self.text = 'base task'
        self.type = 'base'
        self.rows = []

    def execute(self):
        self.state = 'running'
        try:
            self.perform()
        except IOError:
            print "interrupted"

    def perform(self):
        """This method does task's work.
        Override it in your custom task class"""
        while self.alive:
            time.sleep(1)
            print('Tick! The time is: %s' % datetime.now())

    def kill(self):
        self.alive = False
        self.state = 'killed'

    def status(self):
        stt = {}
        stt['id'] = self.id
        stt['progress'] = self.progress
        stt['text'] = self.text
        stt['type'] = self.type
        stt['rows'] = self.rows
        stt['state'] = self.state
        return stt


class DefaultTask(BaseTask):
    """This is default example of task"""

    def perform(self):
        while self.alive:
            time.sleep(1)
            self.progress += 1
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            if self.progress == 100:
                self.state = 'finished'
                self.alive = False
                self.state = 'finished'
            print('Task. The time is: %s' % datetime.now())


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
            print stdout_line
            self.progress += 1
        process.stdout.close()
        self.state = 'finished'
        print process.returncode

    def kill(self):
        self.process.kill()
        self.state = 'killed'
