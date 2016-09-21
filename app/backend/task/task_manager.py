"""
Demonstrates how to use the background scheduler to schedule a job that executes on 3 second
intervals.
"""

from datetime import datetime
from app.backend.task.default_task import DefaultTask, CmdTask
import time
import os

from apscheduler.schedulers.background import BackgroundScheduler


def my_listener(event):
    print event


if __name__ == '__main__':
    scheduler = BackgroundScheduler()
    dt = CmdTask()
    scheduler.add_listener(my_listener)
    job = scheduler.add_job(dt.execute, id="default")
    # scheduler.add_job(default_task.execute, 'interval', seconds=3)
    scheduler.start()
    print('Press Ctrl+{0} to exit'.format('Break' if os.name == 'nt' else 'C'))

    try:
        # This is here to simulate application activity (which keeps the main thread alive).
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        # Not strictly necessary if daemonic mode is enabled but should be done if possible
        scheduler.shutdown()
