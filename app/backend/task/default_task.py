from datetime import datetime
import time
import os
import subprocess
import random


class BaseTask:

    alive = True

    def __init__(self):
        self.alive = True
        self.process = None
        self.id = random.random()
        self.progress = 0
        self.state = 'ready'
        self.text = 'base task'
        self.type = 'base'
        self.plot = []

    def execute(self):
        self.state = 'running'
        try:
            self.perform()
        except IOError:
            print "interrupted"

    def perform(self):
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
        stt['plot'] = self.plot
        stt['state'] = self.state
        return stt


class DefaultTask(BaseTask):
    def perform(self):
        while self.alive:
            time.sleep(1)
            self.progress += 1
            if self.progress == 100:
                self.state = 'finished'
            print('Task. The time is: %s' % datetime.now())


class CmdTask(BaseTask):
    def perform(self):
        bash_command = "/home/yegor/trash/DLS/app/backend/task/test.sh"
        tenv = os.environ.copy()
        tenv['LC_ALL'] = "C"
        process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE, env=tenv)
        self.process = process
        stdout_lines = iter(process.stdout.readline, "")
        for stdout_line in stdout_lines:
            print stdout_line
        process.stdout.close()
        print process.returncode

    def kill(self):
        self.process.kill()
