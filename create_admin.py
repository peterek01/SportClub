from datetime import datetime
from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    if not User.query.filter_by(email="admin@example.com").first():
        admin = User(
            first_name="Admin",
            last_name="Superuser",
            email="admin@example.com",
            password=generate_password_hash("admin123"),
            date_of_birth=datetime.strptime("1990-01-01", "%Y-%m-%d").date(),
            phone_number="+49 157 6543210",
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()
        print("✅ Admin has been added!")
    else:
        print("✅ Admin already exists!")
