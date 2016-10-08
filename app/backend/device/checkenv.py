import pip
import os
import subprocess
import logging
import config

logger = logging.getLogger("dls")
cfg = config.Config()

def get_base_dir():
    basedir = os.path.abspath(os.path.dirname(__file__))
    return basedir + '/../../..'


def check_required_packages():
    result = {}
    req_file = get_base_dir() + "/requirements.txt"
    f = open(req_file, "r")
    for line in f:
        name = line.split("==")[0]
        result[name] = checkpackageinstalled(name, '')
    return result


def checkpackageinstalled(name, version):
    installed_packages = pip.get_installed_distributions()
    for i in installed_packages:
        if i.key.lower() == name.lower() and (i.version == version or not version):
            return True

    return False


def check_cuda():
    """Checks if CUDA is installed and works properly or not
    Returns true/false"""
    result = {}
    try:
        bash_command = get_base_dir() + "/checkCuda.sh " + cfg.CUDA_VERSION
        process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
        logger.info(process.communicate()[0])
        result['return'] = process.returncode
    except OSError as e:
        logger.exception(e)
        result['return'] = -1
        result['error'] = str(e)
    return result


def check_graphviz():
    """Checks if Graphviz binaries are installed
        Returns true/false"""
    result = {}
    binaries = [ '/usr/bin/neato -V', '/usr/bin/dot -V', '/usr/bin/fdp -V','/usr/bin/sfdp -V', '/usr/bin/twopi -V',
                 '/usr/bin/circo -V']
    try:
        for b in binaries:
            bash_command = b
            process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
            out = process.communicate()[0]
            logger.info(out)
            if process.returncode != 0:
                result['return'] = process.returncode
                result['error'] = out
        result['return'] = 0
    except OSError as e:
        logger.exception(e)
        result['return'] = -1
        result['error'] = str(e)
    return result


def check_environment():
    """High level method. Returns Map with results of environment chech"""
    result =  {}
    result['packages'] = check_required_packages()
    result['cuda'] = check_cuda()
    result['graphvis'] = check_graphviz()
    return result


if __name__ == '__main__':

    info = check_environment()
    print(info)
    if info['cuda']['return'] == 0:
        print 'CUDA: OK'
    else:
        print 'CUDA: NOK'
        print(info['cuda']['error'])

    if info['graphvis']['return'] == 0:
        print 'Graphviz: OK'
    else:
        print 'Graphviz: NOK'
        print(info['graphvis']['error'])


