import os
from app.backend import app_flask


def runapp():
    port = int(os.environ.get('PORT', 5001))
    app_flask.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    runapp()
