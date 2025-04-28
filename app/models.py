from datetime import datetime, timedelta
from app import db

# Intermediate table for many-to-many relationships
user_course = db.Table(
    'user_course',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True)
)


user_classes = db.Table(
        "user_classes",
        db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
        db.Column("class_id", db.Integer, db.ForeignKey("course_class.id"), primary_key=True)
    )


def get_utc_now():
    return (datetime.utcnow() + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(20), nullable=False)
    last_name = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(10), default="user")
    created_at = db.Column(db.String(19), default=get_utc_now, nullable=False)
    updated_at = db.Column(db.String(19), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Many-to-many relationship → a user can enroll in multiple courses
    courses = db.relationship('Course', secondary=user_course, backref='students')
    classes = db.relationship("CourseClass", secondary="user_classes", back_populates="users")


class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.String(19), default=get_utc_now, nullable=False)
    updated_at = db.Column(db.String(19), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # One-to-many relationship → a course can have many classes (CourseClass)
    classes = db.relationship("CourseClass", backref="course", lazy=True)


class CourseClass(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(8), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    trainer = db.Column(db.String(50), nullable=False)
    available_spots = db.Column(db.Integer, nullable=False)
    total_max_spots = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.String(19), default=get_utc_now, nullable=False)
    updated_at = db.Column(db.String(19), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Many-to-many relationship → users signed up for specific classes
    users = db.relationship("User", secondary="user_classes", back_populates="classes")

    def formatted_time(self):
        try:
            dt = datetime.strptime(self.date, "%Y-%m-%d %H:%M")
            return dt.strftime("%H:%M")
        except ValueError:
            return self.date

