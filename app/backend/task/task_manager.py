"""
Demonstrates how to use the background scheduler to schedule a job that executes on 3 second
intervals.
"""

from app.backend.task.default_task import DefaultTask, CmdTask
import time
import logging
import json
from app.backend import socketio
logging.basicConfig()

from apscheduler.schedulers.background import BackgroundScheduler


class TaskManager:

    def __init__(self):
        print "init Task Manager"
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.tasks = {}
        self.scheduler.add_job(self.report_progress, 'interval', seconds=1)
        self.identity = 0

    def start_task(self, task):
        self.scheduler.add_job(func=task.execute)
        task.id = self.identity
        self.tasks[self.identity] = task
        self.identity += 1

    def term_task(self, index):
        task = self.tasks[index]
        task.kill()
        #self.tasks.pop(index)

    def shutdown(self):
        self.scheduler.shutdown()

    def report_progress(self):
        print("sending tasks progress")
        task_data = []
        for t in self.tasks.values():
            task_data.append(t.status())
        socketio.emit('task_monitor', json.dumps(task_data))




if __name__ == '__main__':

    tm = TaskManager()
    t = DefaultTask()
    tm.start_task(t)

    try:
        # This is here to simulate application activity (which keeps the main thread alive).
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        # Not strictly necessary if daemonic mode is enabled but should be done if possible
        tm.term_task(0)
        tm.shutdown()
