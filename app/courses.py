from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Course, CourseClass, ClassRegistration, User
from app.auth import admin_required

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


@courses_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_course():
    data = request.json

    if not all(k in data for k in ['name', 'description', 'available_spots']):
        return jsonify({"error": "Missing required fields"}), 400

    existing_course = Course.query.filter_by(name=data["name"]).first()
    if existing_course:
        return jsonify({"error": "Course already exists"}), 409

    new_course = Course(
        name=data["name"],
        description=data["description"],
        available_spots=data["available_spots"]
    )

    db.session.add(new_course)
    db.session.commit()

    return jsonify({"message": "Course created successfully!", "course_id": new_course.id}), 201


@courses_bp.route("/public", methods=["GET"])
def get_public_courses():
    courses = Course.query.all()

    return jsonify([{
        "id": course.id,
        "name": course.name,
        "description": course.description,
        "available_spots": course.available_spots
    } for course in courses]), 200


@courses_bp.route("/my-courses", methods=["GET"])
@jwt_required()
def get_user_courses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify([{
        "id": course.id,
        "name": course.name,
        "description": course.description
    } for course in user.courses]), 200


@courses_bp.route("/<int:course_id>/join", methods=["POST"])
@jwt_required()
def join_course(course_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    course = Course.query.get(course_id)

    if not user or not course:
        return jsonify({"error": "User or course not found"}), 404

    if course in user.courses:
        return jsonify({"error": "Already joined this course"}), 409

    if course.available_spots <= 0:
        return jsonify({"error": "No available spots in this course"}), 400

    user.courses.append(course)
    course.available_spots -= 1

    db.session.commit()

    return jsonify({"message": "Successfully joined the course!"}), 200


@courses_bp.route('/<int:course_id>/classes', methods=['POST'])
@jwt_required()
@admin_required
def add_course_class(course_id):
    data = request.json
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404

    if not all(k in data for k in ["date", "location", "trainer"]):
        return jsonify({"error": "Missing required fields"}), 400

    new_class = CourseClass(
        course_id=course.id,
        date=data["date"],
        location=data["location"],
        trainer=data["trainer"]
    )

    db.session.add(new_class)
    db.session.commit()

    return jsonify({"message": "Class added successfully!", "class_id": new_class.id}), 201


@courses_bp.route('/<int:course_id>/classes', methods=['GET'])
@jwt_required()
def get_course_classes(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    classes = CourseClass.query.filter_by(course_id=course_id).all()

    return jsonify([{
        "id": c.id,
        "date": c.date,
        "location": c.location,
        "trainer": c.trainer
    } for c in classes]), 200


@courses_bp.route('/my-classes', methods=["GET"])
@jwt_required()
def get_user_classes():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    registrations = ClassRegistration.query.filter_by(user_id=user.id).all()
    classes = [registration.course_class for registration in registrations]

    if not classes:
        return jsonify({"classes": [], "message": "No classes enrolled yet"}), 200

    return jsonify([{
        "id": course_class.id,
        "course_name": course_class.course.name,
        "trainer": course_class.trainer,
        "course_date": course_class.date
    } for course_class in classes]), 200


@courses_bp.route('/<int:course_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_course(course_id):
    data = request.json
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404

    if "name" in data:
        course.name = data["name"]

    if "description" in data:
        course.description = data["description"]

    if "available_spots" in data:
        try:
            course.available_spots = int(data["available_spots"])
        except ValueError:
            return jsonify({"error": "available_spots must be an integer"}), 400

    db.session.commit()

    return jsonify({"message": "Course updated successfully!"}), 200


@courses_bp.route('/<int:course_id>/classes/<int:class_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_course_class(course_id, class_id):
    data = request.json
    course_class = CourseClass.query.filter_by(id=class_id, course_id=course_id).first()

    if not course_class:
        return jsonify({"error": "Class not found"}), 404

    if "date" in data:
        try:
            course_class.date = (datetime.strptime(data["date"], "%Y-%m-%d %H:%M").strftime("%Y-%m-%d %H:%M"))
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM"}), 400

    if "location" in data:
        course_class.location = data["location"]

    if "trainer" in data:
        course_class.trainer = data["trainer"]

    db.session.commit()

    return jsonify({"message": "Class updated successfully!"}), 200


@courses_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_course(course_id):
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404

    CourseClass.query.filter_by(course_id=course_id).delete()
    db.session.delete(course)
    db.session.commit()

    return jsonify({"message": "Course and all classes deleted successfully!"}), 200


@courses_bp.route('/<int:course_id>/classes/<int:class_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_class(course_id, class_id):
    course_class = CourseClass.query.filter_by(id=class_id, course_id=course_id).first()

    if not course_class:
        return jsonify({"error": "Class not found"}), 404

    db.session.delete(course_class)
    db.session.commit()

    return jsonify({"message": "Class deleted successfully!"}), 200



    # Add class
    #   curl -X POST http://127.0.0.1:5000/api/courses/1/classes \
    #  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTgxMDc2OSwianRpIjoiOTZiZGIwYmUtZTc5ZC00NThhLWFlOTYtMGNlMGFhMTM5ZTBmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NDE4MTA3NjksImNzcmYiOiJmZjQzOTkzMC05YTUxLTQyNDAtOTE1Mi1kNmY3MTFmOTA4MzEiLCJleHAiOjE3NDE4OTcxNjl9.MOngELghP1OiphcaYF5bYp4ZSXXRHy7s3ps53AbDsbU" \
    #  -H "Content-Type: application/json" \
    #  -d '{
    #       "date": "2025-04-02 18:00",
    #       "location": "Field B",
    #       "trainer": "Krzysztof Kowalski"
    #      }'


    # Change details
    #   curl -X PUT http://127.0.0.1:5000/api/courses/1/classes/1 \
    #  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTgxMDc2OSwianRpIjoiOTZiZGIwYmUtZTc5ZC00NThhLWFlOTYtMGNlMGFhMTM5ZTBmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NDE4MTA3NjksImNzcmYiOiJmZjQzOTkzMC05YTUxLTQyNDAtOTE1Mi1kNmY3MTFmOTA4MzEiLCJleHAiOjE3NDE4OTcxNjl9.MOngELghP1OiphcaYF5bYp4ZSXXRHy7s3ps53AbDsbU" \
    #  -H "Content-Type: application/json" \
    #  -d '{
    #       "course_date": "2025-04-10 16:00",
    #       "course_location": "Field A",
    #       "trainer": "Mark Nowak"
    #      }'


# curl -X DELETE http://127.0.0.1:5000/api/courses/1 \
#      -H "Authorization: Bearer TWÓJ_TOKEN_ADMINA"

# curl -X DELETE http://127.0.0.1:5000/api/courses/1/classes/2 \
#      -H "Authorization: Bearer TWÓJ_TOKEN_ADMINA"
