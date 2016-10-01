import pytest
from app.backend.task.task_manager import TaskManager
from app.backend.task.default_task import Task, DefaultTask


@pytest.fixture
def task_manager():
    return TaskManager()


def test_start_task(task_manager):
    task_manager.start_task(Task())
    task_manager.start_task(Task())
    progress = task_manager.report_progress()
    assert 2 == len(progress)


def test_start_task_null(task_manager):
    with pytest.raises(AttributeError):
        task_manager.start_task(None)


def test_kill_task(task_manager):
    task = DefaultTask()
    task_manager.start_task(task)
    task_manager.term_task(task.id)
    progress = task_manager.report_progress()
    assert 1 == len(progress)
    assert 'killed' == progress[0]['state']





