import flask
from flask import request


util = flask.Blueprint(__name__, __name__)


@util.route('/image/load', methods=['GET'])
def load_image():
    image_path = request.args.get('imagePath')
    with open(image_path, 'r') as f:
        return f.read()