from flask import Flask
# ORM library – allows you to communicate with the database
# via Python objects
from flask_sqlalchemy import SQLAlchemy
# Library from flask-jwt-extended –
# used to manage JWT tokens (login, authorization)
from flask_jwt_extended import JWTManager
# Library – allows the front end (e.g. React)
# to connect to the backend on a different port.
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()  # create SQLAlchemy
jwt = JWTManager()
migrate = Migrate()


def create_app():
    # an instance of the Flask application,
    # __name__ allows Flask to find paths to files (e.g. static folders)
    app = Flask(__name__)
    # We load the configuration from the Config class
    app.config.from_object(Config)

    db.init_app(app)  # Initialization SQLAlchemy
    migrate.init_app(app, db)
    jwt.init_app(app)
    # We are limiting CORS to API only
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    from app.auth import auth_bp
    from app.courses import courses_bp, classes_bp
    from app import models

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(classes_bp, url_prefix="/api/classes")

    # with app.app_context():
    #     db.create_all()

    return app

