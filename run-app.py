import os
from app.backend import app_flask, socketio


def runapp():
    port = int(os.environ.get('PORT', 5001))
    print ('Go to URL: http://localhost:%d' % port)
    socketio.run(app_flask, port=port, debug=True)

if __name__ == '__main__':
    runapp()
