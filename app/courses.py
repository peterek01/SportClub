from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Course, CourseClass, User
from app.auth import admin_required

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")
classes_bp = Blueprint("classes", __name__, url_prefix="/api/classes")


@courses_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_course():
    data = request.json

    if not all(k in data for k in ['name', 'description']):
        return jsonify({"error": "Missing required fields"}), 400

    existing_course = Course.query.filter_by(name=data["name"]).first()
    if existing_course:
        return jsonify({"error": "Course already exists"}), 409

    new_course = Course(
        name=data["name"],
        description=data["description"],
    )

    db.session.add(new_course)
    db.session.commit()

    return jsonify({"message": "Course created successfully!", "course_id": new_course.id}), 201


@courses_bp.route("/public", methods=["GET"])
def get_public_courses():
    courses = Course.query.all()

    return jsonify([
        {
            "id": course.id,
            "name": course.name,
            "description": course.description,
            "class_count": len(course.classes),
            "total_available_spots": sum(c.available_spots for c in course.classes),
        }
        for course in courses
    ]), 200


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


@classes_bp.route("/<int:class_id>/join", methods=["POST"])
@jwt_required()
def join_class(class_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    course_class = CourseClass.query.get(class_id)

    if not user or not course_class:
        return jsonify({"error": "User or class not found"}), 404

    if course_class in user.classes:
        return jsonify({"error": "You are already registered in this class."}), 409

    if course_class.available_spots <= 0:
        return jsonify({"error": "No available spots in this class"}), 400

    user.classes.append(course_class)
    course_class.available_spots -= 1

    db.session.commit()

    return jsonify({"message": "Successfully joined the classes!"}), 200


@courses_bp.route('/<int:course_id>/classes', methods=['POST'])
@jwt_required()
@admin_required
def add_course_class(course_id):
    data = request.json
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404

    if not all(k in data for k in ["day_of_week", "time", "location", "trainer", "available_spots"]):
        return jsonify({"error": "Missing required fields"}), 400

    new_class = CourseClass(
        course_id=course.id,
        day_of_week=data["day_of_week"],
        time=data["time"],
        location=data["location"],
        trainer=data["trainer"],
        available_spots=data["available_spots"],
        total_max_spots=data["available_spots"]
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
        "day_of_week": c.day_of_week,
        "time": c.time,
        "location": c.location,
        "trainer": c.trainer,
        "available_spots": c.available_spots,
        "total_max_spots": c.total_max_spots,
    } for c in classes]), 200


@courses_bp.route('/my-classes', methods=["GET"])
@jwt_required()
def get_user_classes():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.classes:
        return jsonify({"classes": [], "message": "No classes enrolled yet"}), 200

    return jsonify([{
        "id": course_class.id,
        "course_name": course_class.course.name,
        "trainer": course_class.trainer,
        "day_of_week": course_class.day_of_week,
        "time": course_class.time
    } for course_class in user.classes]), 200


@classes_bp.route("/<int:class_id>/leave", methods=["DELETE"])
@jwt_required()
def leave_class(class_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    course_class = CourseClass.query.get(class_id)

    if not user or not course_class:
        return jsonify({"error": "User or class not found"}), 404

    if course_class not in user.classes:
        return jsonify({"error": "You are not registered in this class"}), 400

    user.classes.remove(course_class)
    course_class.available_spots += 1
    db.session.commit()

    return jsonify({"message": "Successfully left the class"}), 200


@classes_bp.route("/<int:class_id>/members", methods=["GET"])
@jwt_required()
@admin_required
def get_class_members(class_id):
    course_class = CourseClass.query.get(class_id)
    if not course_class:
        return jsonify({"error": "Class not found"}), 404

    members = course_class.users
    return jsonify([{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name
    } for user in members]), 200


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

    if "day_of_week" in data:
        course_class.day_of_week = data["day_of_week"]

    if "time" in data:
        course_class.time = data["time"]

    if "location" in data:
        course_class.location = data["location"]

    if "trainer" in data:
        course_class.trainer = data["trainer"]

    if "available_spots" in data:
        try:
            course_class.available_spots = int(data["available_spots"])
        except ValueError:
            return jsonify({"error": "available_spots must be an integer"}), 400

    db.session.commit()

    return jsonify({"message": "Class updated successfully!"}), 200


@courses_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_course(course_id):
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404

    for class_instance in course.classes:
        db.session.delete(class_instance)

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

    course_class.users.clear()

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
