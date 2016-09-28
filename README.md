**Deep Learning Studio**

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