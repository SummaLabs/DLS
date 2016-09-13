from flask import Response

import json
import flask
import subprocess


device = flask.Blueprint(__name__, __name__)

@device.route('/info', methods=["GET"])
def get_system_info():

    info = {}
    gpu_info = generate_gpu_info()
    info['mem'] = generate_mem_info()
    info['gpu'] = gpu_info
    info['cpu'] = generate_cpu_info()
    info['gpuSelected'] = gpu_info[0]['id']
    return Response(json.dumps(info), mimetype='application/json')


def retrieve_tokens(s, line_num):
    tokens_string = s.split('\n')[line_num].split(' ')
    return filter(lambda x: x != '', tokens_string)


# Get Memory Summary info
def generate_mem_info():
    bash_command = "free -m"
    process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
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
        bash_command = "nvidia-smi --query-gpu=index,name,uuid,memory.total,memory.free,memory.used,count --format=csv"
        process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
        output = process.communicate()[0]
        lines = output.split("\n")
        lines.pop(0)
        for l in lines:
            tokens = l.split(", ")
            if len(tokens) > 6:
                gpu_info.append({'id': tokens[0], 'name': tokens[1], 'mem': tokens[3], 'cores': tokens[6]})
    except OSError:
        # Some mock value for testing on machines without NVidia GPU
        gpu_info.append({'id': 'not NVidia', 'name': 'not NVidia', 'mem': ''})
    return gpu_info


# Query CPU Info from OS
def generate_cpu_info():
    bash_command = "cat /proc/cpuinfo"
    process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
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


