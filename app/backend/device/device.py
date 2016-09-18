
import os
import json
import subprocess
import datetime


def generate_system_info():
    info = {}
    gpu_info = generate_gpu_info()
    gpu_info.append(gpu_info[0])
    info['mem'] = generate_mem_info()
    info['gpu'] = gpu_info
    info['cpu'] = generate_cpu_info()
    info['ts'] = datetime.datetime.now().time().strftime("%H:%M:%S")
    info['gpuSelected'] = gpu_info[0]['id']
    return json.dumps(info)


def retrieve_tokens(s, line_num):
    tokens_string = s.split('\n')[line_num].split(' ')
    return filter(lambda x: x != '', tokens_string)


# Get Memory Summary info
def generate_mem_info():
    tenv = os.environ.copy()
    tenv['LC_ALL'] = "C"
    bash_command = "free -m"
    process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE, env=tenv)
    output = process.communicate()[0]
    mem_values = retrieve_tokens(output, 1)
    names_values = retrieve_tokens(output, 0)
    mem_values.remove("Mem:")
    zipped = zip(names_values, mem_values)
    mem_info = dict(zipped)
    return mem_info


# Query GPU Info from OS
def generate_gpu_info():
    gpu_info = []
    try:
        tenv = os.environ.copy()
        tenv['LC_ALL']="C"
        bash_command = "nvidia-smi --query-gpu=index,name,uuid,memory.total,memory.free,memory.used,count,utilization.gpu,utilization.memory --format=csv"
        process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE, env=tenv)
        output = process.communicate()[0]
        lines = output.split("\n")
        lines.pop(0)
        for l in lines:
            tokens = l.split(", ")
            if len(tokens) > 6:
                gpu_info.append({'id': tokens[0], 'name': tokens[1], 'mem': tokens[3], 'cores': tokens[6], 'mem_free': tokens[4], 'mem_used': tokens[5],
                                 'util_gpu': tokens[7], 'util_mem': tokens[8]})
    except OSError:
        # Some mock value for testing on machines without NVidia GPU
        gpu_info.append({'id': 'not NVidia', 'name': 'not NVidia', 'mem': ''})
    return gpu_info


# Query CPU Info from OS
def generate_cpu_info():
    bash_command = "cat /proc/cpuinfo"
    tenv = os.environ.copy()
    tenv['LC_ALL'] = "C"
    process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE, env=tenv)
    output = process.communicate()[0]
    lines = output.split("\n")
    if len(lines) > 12:
        cpu = lines[4].split(":")[1]
        cores = lines[12].split(":")[1]
        cache = lines[8].split(":")[1]
        cpu_info = {'id': 'cpu', 'name': cpu, 'cores': cores, 'cache': cache}
    else:
        cpu_info = {'id': 'cpu', 'name': '-', 'cores': '-', 'cache': '-'}
    return cpu_info


