# PowerPlay

**PowerPlay** is a full-stack web application for managing a sports club. It allows users to browse and register for sports courses, and administrators to manage those courses and their classes.

---

## Features

- JWT-based authentication (login/register)
- Role system: admin vs user
- Admin panel for managing courses and classes
- Users can join or leave classes
- Authorization-protected routes (frontend + backend)
- Responsive UI styled with Tailwind CSS
- Modal components for add/edit/delete actions
- Participant list for each class (admin only)

---

## Tech Stack

### Backend (Python + Flask):
- Flask (API + routing)
- Flask-JWT-Extended (authentication)
- SQLAlchemy (ORM)
- Flask-Migrate (DB migrations)
- Flask-CORS (CORS support)
- SQLite (local DB)

### Frontend (React):
- React (components, routing)
- Tailwind CSS (styling)
- React Router
- Custom hooks (e.g. useRole, useTokenExpiry)
- LocalStorage for token/role management

### Deployment:
- Vercel – frontend
- Render – backend

---

## Project Structure

### Backend:
```
backend/
├── app/
│   ├── auth_bp.py     # Login, register
│   ├── courses_bp.py  # Courses & classes logic
│   ├── classes_bp.py  # Join/leave classes
│   └── models.py      # User, Course, CourseClass models
├── run.py             # Main Flask app
└── config.py          # Config & env
```

### Frontend:
```
frontend/
├── components/
│   ├── admin/           # Admin views and modals
│   └── common/          # Reusable components (Modal)
├── hooks/               # useRole, useTokenExpiry
├── utils/               # logout.js, ClearAuthStorage.js
└── App.jsx              # Routing & token handling
```

---

## 🔄 API Endpoints

| Method | Endpoint                        | Description |
| POST   | `/api/auth/register`            | Register new user |
| POST   | `/api/auth/login`               | Login with email + password |
| GET    | `/api/courses/public`           | List of all available courses  |
| POST   | `/api/classes/<id>/join`        | Join a class |
| POST   | `/api/classes/<id>/leave`       | Leave a class |
| GET    | `/api/classes/<id>/members`     | Get list of class members (admin) |

---

## 🔐 Roles

- **User**:
  - View public courses
  - Join/leave classes
  - Delete own account

- **Admin**:
  - Create, edit, delete courses
  - Manage classes
  - View participants

---

## 🚚 How to Run

### 1. Clone the repo
```bash
git clone https://github.com/peterek01/SportClub.git
cd SportClub
```

### 2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Live Demo

Frontend: https://sport-club-git-main-piotrs-projects-3b8acd4b.vercel.app/

Backend: deployed on Render (private API)

---

## 😊 Author
**Piotr Kulbacki**

Feel free to contribute or leave feedback!
