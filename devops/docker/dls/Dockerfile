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
ADD dls/ /opt/dls
RUN mkdir -p  /opt/dls/data/datasets
WORKDIR /opt/dls
RUN npm install grunt-cli -g
#RUN npm install

RUN sudo pip install -r requirements.txt
#RUN grunt
CMD python run-app.py
