from datetime import datetime, timedelta
# Blueprint - allows to split your Flask app into modules (here: auth)
# request - to read data from a request (e.g. JSON from a login form)
# jsonify - converts Python data to JSON for HTTP response
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
# get_jwt – gets the entire token payload (to check roles, for example)
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
# To create own decorators - here we use it in admin_required
from functools import wraps
from app import db
from app.models import User

# All paths will have prefix: /api/auth/
auth_bp = Blueprint("auth", __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    if not all(k in data for k in ["first_name", "last_name", "email", "password", "date_of_birth", "phone_number"]):
        return jsonify({"error": "Missing required fields"}), 400

    # .first() - Returns the first result that matches the query, or None if nothing is found.
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = generate_password_hash(data["password"])
    new_user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=hashed_password,
        date_of_birth=datetime.strptime(data["date_of_birth"], "%Y-%m-%d").date(),
        phone_number=data["phone_number"]
    )

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(
        identity=str(new_user.id),
        additional_claims={"role": new_user.role},
        expires_delta=timedelta(minutes=5)
    )

    refresh_token = create_refresh_token(identity=str(new_user.id))

    return jsonify({
        "message": "User registered successfully!",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": new_user.role
    }), 201


# user Login and Token Generation
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # create a JWT token with user information
    access_token = (create_access_token(identity=str(user.id),
                                        additional_claims={"role": user.role},
                                        expires_delta=timedelta(minutes=5)))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({"access_token": access_token, "refresh_token": refresh_token, "role": user.role}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    new_access_token = create_access_token(
        identity=user_id,
        additional_claims={"role": user.role},
        expires_delta=timedelta(minutes=5)
    )

    new_refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "role": user.role
    }), 200


# any logged-in user can access /protected if they provide a JWT token
# @auth_bp.route('/protected', methods=['GET'])
# @jwt_required()
# def protected():
#     current_user = get_jwt_identity()
#     return jsonify(msg=f"Hello {current_user}, you are logged in and can access this route.")


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user():
    print("TOKEN IDENTITY:", get_jwt_identity())
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role
    }), 200


@auth_bp.route('/my-classes', methods=["GET"])
@jwt_required()
def get_user_classes():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify([{
        "id": course_class.id,
        "course_name": course_class.course.name,
        "trainer": course_class.trainer,
        "day_of_week": course_class.day_of_week,
        "time": course_class.time,
        "location": course_class.location,
        "available_spots": course_class.available_spots,
        "total_max_spots": course_class.total_max_spots
    } for course_class in user.classes]), 200


@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    user.classes.clear()

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Account deleted successfully"}), 200


# Decorator to check if user is an administrator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        role = claims.get("role")

        if role != "admin":
            return jsonify({"error": "Access denied. Admins only"}), 403
        return f(*args, **kwargs)

    return decorated_function


# curl -H "Authorization: Bearer <token>" http://127.0.0.1:5000/api/auth/me
