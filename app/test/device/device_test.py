from app.backend.device import device
from mock import Mock


def test_generate_mem_info():
    info = device.generate_mem_info()
    assert info is not None
    print info
    assert info['free'] is not None
    assert info['used'] is not None
    assert info['total'] is not None


def test_generate_mem_info_cmd_error():
    device.execute_bash_command = Mock(return_value="", side_effect=OSError())
    info = device.generate_mem_info()
    assert info is not None
    print info


def test_generate_cpu_info():
    info = device.generate_cpu_info()
    print info
    assert info['name'] is not None
    assert info['cores'] is not None
    assert info['cache'] is not None


def test_generate_cpu_info_cmd_error():
    device.execute_bash_command = Mock(return_value="", side_effect=OSError())
    info = device.generate_cpu_info()
    print info
    assert info['name'] is not None
    assert info['cores'] is not None
    assert info['cache'] is not None


def test_generate_gpu_info():
    gpu_infos = device.generate_gpu_info()
    gpu_info = gpu_infos[0]
    print gpu_info
    assert gpu_info['id'] is not None
    assert gpu_info['name'] is not None
    assert gpu_info['mem'] is not None


def test_generate_gpu_info_no_smi():
    device.execute_bash_command = Mock(return_value="", side_effect=OSError())
    gpu_infos = device.generate_gpu_info()
    gpu_info = gpu_infos[0]
    print gpu_info
    assert gpu_info['id'] is not None
    assert gpu_info['name'] is not None
    assert gpu_info['mem'] is not None


def test_generate_gpu_pids():
    info = device.generate_gpu_pids()
    assert info is not None


def test_generate_gpu_pids_no_smi():
    device.execute_bash_command = Mock(return_value="", side_effect=OSError())
    info = device.generate_gpu_pids()
    assert info is not None



