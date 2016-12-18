
import os
import json
import subprocess
import datetime
import re
import logging

logger = logging.getLogger('DLS')


def generate_system_info():
    info = {}
    gpu_info = generate_gpu_info()
    if (len(gpu_info) > 0):
        gpu_pids = generate_gpu_pids()
        for g in gpu_info:
            g['gpu_pids'] = filter(lambda x: x['gpu'] == g['id'], gpu_pids)
        info['gpu'] = gpu_info
        info['gpuSelected'] = gpu_info[0]['id']

    info['mem'] = generate_mem_info()
    info['cpu'] = generate_cpu_info()
    info['ts'] = datetime.datetime.now().time().strftime("%H:%M:%S")
    return json.dumps(info)


def retrieve_tokens(s, line_num):
    tokens_string = s.split('\n')[line_num].split(' ')
    return filter(lambda x: x != '', tokens_string)


# Get Memory Summary info
def generate_mem_info():
    try:
        output = execute_bash_command("free -m")
        mem_values = retrieve_tokens(output, 1)
        names_values = retrieve_tokens(output, 0)
        mem_values.pop(0)
        zipped = zip(names_values, mem_values)
        mem_info = dict(zipped)
        return mem_info
    except OSError:
        return {'total': 0, 'used': 0, 'free': 0, 'shared': 0, 'buffers': 0, 'cached':0 }


# Query GPU Info from OS
def generate_gpu_info():
    gpu_info = []
    try:
        bash_command = "nvidia-smi --query-gpu=index,name,uuid,memory.total,memory.free,memory.used,count,utilization.gpu,utilization.memory --format=csv"
        output = execute_bash_command(bash_command)
        lines = output.split("\n")
        lines.pop(0)
        for l in lines:
            tokens = l.split(", ")
            if len(tokens) > 6:
                gpu_info.append({'id': tokens[0], 'name': tokens[1], 'mem': tokens[3], 'cores': tokens[6], 'mem_free': tokens[4], 'mem_used': tokens[5],
                                 'util_gpu': tokens[7], 'util_mem': tokens[8]})
    except OSError:
        logger.info("GPU device is not available")

    return gpu_info

def get_available_devices_list():
    tret = []
    cpuInfo=generate_cpu_info()
    memInfo=generate_mem_info()
    tmemTotal    = int(memInfo['total'])
    tmemFreeReal = int(memInfo['free']) #+int(memInfo['buffers'])+int(memInfo['cached'])
    tmemUsage    = tmemTotal - tmemFreeReal
    tret.append({
        'id':           'cpu',
        'type':         'cpu',
        'name':         cpuInfo['name'].strip(),
        'memtotal':     tmemTotal,
        'memusage':     tmemUsage,
        'pmemusage':    int(100*float(tmemUsage)/float(tmemTotal)),
        'isbusy':       False,
        'isAvalible': True
    })
    gpuInfo = generate_gpu_info()
    if (len(gpuInfo) == 0):
        tret.append({'isAvalible': False, 'type': 'gpu'})
        return tret

    for ii in gpuInfo:
        isAvalible = True
        tid = 'gpu%s' % ii['id']
        tgmemTotal  = re.sub('[A-Za-z:,. ]', '', ii['mem'])
        tgmemUsage  = re.sub('[A-Za-z:,. ]', '', ii['mem_used'])
        if int(tgmemTotal)>0:
            pgmemUsage  = int(100*float(tgmemUsage)/float(tgmemTotal))
            isBusy = pgmemUsage>40
        else:
            tgmemTotal = 'unknown'
            tgmemUsage = 'unknown'
            pgmemUsage = 0
            isBusy     = True,
            isAvalible = False
        tret.append({
            'id':           tid,
            'type':         'gpu',
            'name':         ii['name'].strip(),
            'memtotal':     tgmemTotal,
            'memusage':     tgmemUsage,
            'pmemusage':    pgmemUsage,
            'isbusy':       isBusy,
            'isAvalible': isAvalible
        })
    return tret

def get_available_devices_dict():
    tret = {}
    tmp = get_available_devices_list()
    for kk in tmp:
        tret[kk] = tmp
    return tret

def get_available_devices_list_json():
    return json.dumps(get_available_devices_list())

def get_available_devices_dict_json():
    return json.dumps(get_available_devices_dict())

# Query GPU Processes info
def generate_gpu_pids():
    gpu_pids = []
    try:
        bash_command = "nvidia-smi pmon -c 1"
        output = execute_bash_command(bash_command)
        lines = output.split("\n")
        lines.pop(0)
        lines.pop(0)
        for l in lines:
            tokens = l.split(" ")
            tokens = filter(lambda x: x != '', tokens)

            if len(tokens) > 6:
                gpu_pids.append({'gpu': tokens[0], 'pid': tokens[1], 'type': tokens[2], 'sm': tokens[3], 'mem': tokens[4], 'enc': tokens[5],
                                 'dec': tokens[6], 'cmd': tokens[7]})
    except OSError:
        # Some mock value for testing on machines without NVidia GPU
        gpu_pids.append(
            {'gpu': '0', 'pid': '0', 'type': '-', 'sm': '0', 'mem': '0', 'enc': '0',
             'dec': '0', 'cmd': '-'})
    return gpu_pids


# Query CPU Info from OS
def generate_cpu_info():
    empty_info = {'id': 'cpu', 'name': '-', 'cores': '-', 'cache': '-'}
    try:
        output = execute_bash_command("cat /proc/cpuinfo")
        lines = output.split("\n")
        if len(lines) > 12:
            cpu = lines[4].split(":")[1]
            cores = lines[12].split(":")[1]
            cache = lines[8].split(":")[1]
            cpu_info = {'id': 'cpu', 'name': cpu, 'cores': cores, 'cache': cache}
        else:
            cpu_info = empty_info
        return cpu_info
    except OSError:
        return empty_info


def execute_bash_command(cmd):
    tenv = os.environ.copy()
    tenv['LC_ALL'] = "C"
    bash_command = cmd
    process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE, env=tenv)
    return process.communicate()[0]



