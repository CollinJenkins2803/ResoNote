from flask import Flask
from .config import Config
from .routes import routes
from .extensions import socketio

def create_app():
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(Config)

    # Register blueprints
    app.register_blueprint(routes)

    # Initialize extensions
    socketio.init_app(app)

    return app
