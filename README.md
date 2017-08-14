**Deep Learning Studio Demo**

[![Deep Learning Studio Demo](http://img.youtube.com/vi/nC0bVDBWvF0/0.jpg)](https://www.youtube.com/watch?v=nC0bVDBWvF0)

_How to build and run_:
* cd to DLS root dir
* Install python and pip if not installed
* Run ```pip install -r requirements.txt``` command
* Install npm if not installed
* Run ```npm install``` command
* Run ~~npm run-script grunt~~ command
* Run ```python run-app.py``` or ```./run-flask-app.sh``` command

_Run back-end tests_:
* pytest

_Run tests with coverage report_:
* py.test --cov-report term --cov=app app/test

More about measuring test coverage: https://pypi.python.org/pypi/pytest-cov

_Run With Docker
* install nvidia-docker as described here https://github.com/NVIDIA/nvidia-docker
* sudo docker login
* sudo docker pull yegortsebro/dls
* sudo nvidia-docker  run -p 5001:5001 --name dls dls/dls
