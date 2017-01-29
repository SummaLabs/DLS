FROM nvidia/cuda:7.5-cudnn5-devel-ubuntu14.04
MAINTAINER Yehor Tsebro <egortsb@gmail.com>
#Update pip
RUN \
  apt-get update && \
  apt-get install -y python python-dev python-pip curl git
RUN sudo pip install -U pip

RUN sudo apt-get install -y pkg-config  graphviz libgraphviz-dev  python-tk
RUN easy_install pygraphviz

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN mkdir -p  /opt/dls

ADD app /opt/dls/app
ADD data /opt/dls/data
ADD data-test /opt/dls/data-test
ADD data-design /opt/dls/data-design
ADD run-app.py /opt/dls/run-app.py
ADD config.py /opt/dls/config.py
ADD requirements.txt /opt/dls/requirements.txt

WORKDIR /opt/dls
RUN npm install grunt-cli -g
#RUN npm install

RUN sudo pip install -r requirements.txt
RUN pip install toposort
RUN pip install h5py
#RUN grunt
CMD python run-app.py
