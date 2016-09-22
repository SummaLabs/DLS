"""
Demonstrates how to use the background scheduler to schedule a job that executes on 3 second
intervals.
"""

from app.backend.task.default_task import DefaultTask, CmdTask
import time
import logging
import json
import gevent.monkey
from app.backend import socketio
logging.basicConfig()
gevent.monkey.patch_thread()

from apscheduler.schedulers.background import BackgroundScheduler


class TaskManager:
    """Simple wrapper for Advanced Python Scheduler"""

    def __init__(self):
        print "init Task Manager"
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()

        # Map of tasks for tracking them on UI
        self.tasks = {}
        self.scheduler.add_job(self.report_progress, 'interval', seconds=1)
        self.identity = 0

    # Starts new task
    def start_task(self, task):

        self.scheduler.add_job(func=task.execute)
        task.id = self.identity
        self.tasks[self.identity] = task
        self.identity += 1

    # Kills task by it's ID
    def term_task(self, index):
        task = self.tasks[index]
        task.kill()

    def shutdown(self):
        self.scheduler.shutdown()

    def report_progress(self):
        """Gathers information from task and sends to clients"""

        print("sending tasks progress")
        task_data = []
        for t in self.tasks.values():
            task_data.append(t.status())
        socketio.emit('task_monitor', json.dumps(task_data))


# Some simple testing
if __name__ == '__main__':

    tm = TaskManager()
    t = CmdTask("/home/yegor/trash/DLS/app/backend/task/test.sh")
    tm.start_task(t)
    tm.start_task(t)

    try:
        # This is here to simulate application activity (which keeps the main thread alive).
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        # Not strictly necessary if daemonic mode is enabled but should be done if possible
        tm.term_task(0)
        tm.shutdown()
