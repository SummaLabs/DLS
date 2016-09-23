from app.backend.task.default_task import DefaultTask, CmdTask
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.schedulers.gevent import GeventScheduler
from app.backend import socketio
from config import DevelopmentConfig
from gevent import monkey
import time
import logging
import json

logging.basicConfig()
# Needed this to avoid deadlock
monkey.patch_all()


class TaskManager:
    """Simple wrapper for Advanced Python Scheduler"""

    def __init__(self):
        print "init Task Manager"

        self.app_config = DevelopmentConfig()
        executors = {
            'default': ThreadPoolExecutor(self.app_config.EXECUTOR_THREADS_NUMBER),
            'monitor': ThreadPoolExecutor(self.app_config.EXECUTOR_THREADS_NUMBER),
        }

        self.scheduler = GeventScheduler(executors=executors)
        self.scheduler.start()

        # Map of tasks for tracking them on UI
        self.tasks = {}
        self.scheduler.add_job(self.report_progress, 'interval', seconds=self.app_config.JOB_MONITOR_INTERVAL, executor='monitor')
        self.identity = 0

    # Starts new task
    def start_task(self, task):

        self.scheduler.add_job(func=task.execute, misfire_grace_time=self.app_config.MISFIRE_GRACE_TIME)
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
