"""
Demonstrates how to use the background scheduler to schedule a job that executes on 3 second
intervals.
"""

from datetime import datetime
from app.backend.task.default_task import DefaultTask, CmdTask
import time
import os

from apscheduler.schedulers.background import BackgroundScheduler


class TaskManager:

    def __init__(self):
        print "init Task Manager"
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.tasks = []

    def start_task(self, task):
        self.scheduler.add_job(func=task.execute)
        self.tasks.append(task)

    def term_task(self, index):
        task = self.tasks[index]
        task.kill()
        self.tasks.pop(index)

    def shutdown(self):
        self.scheduler.shutdown()

    def report_progress(self):
        print("sending tasks progress")


if __name__ == '__main__':

    tm = TaskManager()
    t = CmdTask()
    tm.start_task(t)

    try:
        # This is here to simulate application activity (which keeps the main thread alive).
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        # Not strictly necessary if daemonic mode is enabled but should be done if possible
        tm.term_task(0)
        tm.shutdown()
