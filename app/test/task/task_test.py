import pytest
from app.backend.task.default_task import BaseTask


@pytest.fixture
def default_task():
    return BaseTask()


def test_default_task_run(default_task):
    assert default_task.state == "ready"
    default_task.execute()
    assert default_task.state == "finished"


def test_default_task_kill(default_task):
    default_task.kill()
    assert default_task.state == "killed"
    assert default_task.alive is False


# Expect not to throw Exception for now in such case
def test_default_task_kill_twice(default_task):
    default_task.kill()
    default_task.kill()
    assert default_task.state == "killed"
    assert default_task.alive is False


def test_default_task_state(default_task):
    status = default_task.status()
    assert status['state'] == "ready"
    assert status['id'] is not None

