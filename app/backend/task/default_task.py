from datetime import datetime
import time
import os
import subprocess


class BaseTask:
    """A simple example class"""
    alive = True

    def __init__(self):
        self.alive = True
        self.process = None

    def execute(self):
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


class DefaultTask(BaseTask):
    def perform(self):
        while True:
            time.sleep(1)
            print('Default Task. The time is: %s' % datetime.now())


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
