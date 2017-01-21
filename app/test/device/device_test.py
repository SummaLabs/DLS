import pytest
from app.backend.env import hardware, env
from mock import Mock


def test_generate_mem_info():
    info = hardware.get_mem_info()
    assert info is not None
    print info
    assert info['free'] is not None
    assert info['used'] is not None
    assert info['total'] is not None


def test_generate_mem_info_cmd_error():
    hardware.execute_bash_command = Mock(return_value="", side_effect=OSError())
    info = hardware.get_mem_info()
    assert info is not None
    print info


def test_generate_cpu_info():
    info = hardware.get_cpu_info()
    print info
    assert info['name'] is not None
    assert info['cores'] is not None
    assert info['cache'] is not None


def test_generate_cpu_info_cmd_error():
    hardware.execute_bash_command = Mock(return_value="", side_effect=OSError())
    info = hardware.get_cpu_info()
    print info
    assert info['name'] is not None
    assert info['cores'] is not None
    assert info['cache'] is not None


def test_generate_gpu_info():
    gpu_infos = hardware.get_gpu_info()
    gpu_info = gpu_infos[0]
    print gpu_info
    assert gpu_info['id'] is not None
    assert gpu_info['name'] is not None
    assert gpu_info['mem'] is not None


def test_generate_gpu_info_no_smi():
    hardware.execute_bash_command = Mock(return_value="", side_effect=OSError())
    gpu_infos = hardware.get_gpu_info()
    gpu_info = gpu_infos[0]
    print gpu_info
    assert gpu_info['id'] is not None
    assert gpu_info['name'] is not None
    assert gpu_info['mem'] is not None


def test_generate_gpu_pids():
    info = hardware.generate_gpu_pids()
    assert info is not None


def test_generate_gpu_pids_no_smi():
    hardware.execute_bash_command = Mock(return_value="", side_effect=OSError())
    info = hardware.generate_gpu_pids()
    assert info is not None


if __name__ == '__main__':
    pytest.main([__file__])
