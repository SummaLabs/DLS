import os
from app.backend import app_flask, socketio


def runapp():
    port = int(os.environ.get('PORT', 5001))
    socketio.run(app_flask, port=port, debug=True)


if __name__ == '__main__':
    runapp()
