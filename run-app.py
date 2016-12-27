import os
from app.backend import app_flask, socketio


def runapp():
    port = int(os.environ.get('PORT', 5001))
    print ('Go to URL: http://localhost:%d' % port)
    # app_flask.run(host='0.0.0.0', port=port, debug=True)
    socketio.run(app_flask, port=port, debug=False)


if __name__ == '__main__':
    runapp()
