import { useEffect, useState } from "react";
import useTokenExpiry from "../hooks/useTokenExpiry";
import { logout } from "../utils/logout";
import { useNavigate } from "react-router-dom";
import useRole from "../hooks/useRole";
import AddCourseForm from "./admin/AddCourseForm";
import EditCourseForm from "./admin/EditCourseForm";
import AddClassForm from "./admin/AddClassForm";

// A regular user sees the list of courses and their classes
// They can register for a course, but they cannot create or delete them
function UserDashboard() {
    const token = useTokenExpiry();
    const [courses, setCourses] = useState([]);
    const [userClasses, setUserClasses] = useState([]);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [addingClassCourseId, setAddingClassCourseId] = useState(null);
    const role = useRole();
    const navigate = useNavigate();

    const fetchCourses = () => {
      const token = localStorage.getItem("token");
    
      fetch("http://127.0.0.1:5000/api/courses/public")
        .then((res) => res.json())
        .then((data) => setCourses(data))
        .catch((err) => console.error("Fetch courses error:", err));
    };    

    useEffect(() => {
      if (!token) {
        navigate("/login");
        return;
      }
    
      fetchCourses();
    
      fetch("http://127.0.0.1:5000/api/auth/my-classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch classes");
          return res.json();
        })
        .then((data) => {
          setUserClasses(data);
        })
        .catch((err) => {
          console.error("Fetch classes error:", err);
        });
    
    }, [token, navigate]);

    const fetchUserClasses = () => {
      const token = localStorage.getItem("token");
    
      fetch("http://127.0.0.1:5000/api/auth/my-classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch classes");
          return res.json();
        })
        .then((data) => {
          setUserClasses(data);
        })
        .catch((err) => {
          console.error("Fetch classes error:", err);
        });
    };
    
    useEffect(() => {
      if (!token) {
        navigate("/login");
        return;
      }
    
      fetchCourses();
      fetchUserClasses();
    }, [token, navigate]);

    const handleDeleteCourse = async (courseId) => {
      const token = localStorage.getItem("token");
      const confirmDelete = window.confirm("Are you sure you want to delete this course?");
      if (!confirmDelete) return;

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/courses/${courseId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to delete course");

        window.alert("Course deleted!");
        fetchCourses();
      } catch (error) {
        console.error("Delete course error:", error);
        window.alert("Failed to delete course.");
      }
    };

    if(!token) return <div>Redirecting...</div>;

    return (
      <div className="min-h-screen p-6 bg-gray-100 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
        </h1>
  
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-6"
        >
          Logout
        </button>
  
        {error && <p className="text-red-500">{error}</p>}
  
        {/* Admin-only section */}
        {role === "admin" && (
          <div className="bg-white p-6 shadow-md rounded mb-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Courses</h2>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4">
              ➕ Add New Course
            </button>
            {showAddForm && (
              <AddCourseForm 
                onSuccess={() => {
                  fetchCourses();
                  setShowAddForm(false);
                  window.alert("Course Added!");
                }}
              />
            )}
            <ul>
              {courses.map((course) => (
                <li key={course.id} className="border-b py-2">
                  <span className="font-semibold">{course.name}</span> – {course.description}<br />
                  <span className="font-semibold">Available spots: {course.available_spots}</span>
                  <div className="mt-2 space-x-2">
                    <button onClick={() => setEditingCourse(course)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      ❌ Delete
                    </button>
                    <button onClick={() => setAddingClassCourseId(course.id)} className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600">
                      ➕ Add Class
                    </button>
                  </div>
                  {addingClassCourseId === course.id && (
                    <AddClassForm
                      courseId={course.id}
                      onSuccess={() => {
                        setAddingClassCourseId(null);
                        fetchCourses();
                      }}
                      onCancel={() => setAddingClassCourseId(null)}
                    />
                  )}
                  {editingCourse?.id === course.id && (
                    <EditCourseForm
                      course={editingCourse}
                      onSuccess={() => {
                        setEditingCourse(null);
                        fetchCourses();
                      }}
                      onCancel={() => setEditingCourse(null)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
  
        {/* Regular user view */}
        {role === "user" && (
          <div className="bg-white p-6 shadow-md rounded mb-6">
            <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>
            <ul>
              {courses.map((course) => (
                <li key={course.id} className="border-b py-2">
                  <span className="font-semibold">{course.name}</span> – {course.description}
                  {role !== "admin" && (
                    <button className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                      Join
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
  
        {/* User classes – shared for all users */}
        {role === "user" && (
          <div className="bg-white p-6 shadow-md rounded">
            <h2 className="text-2xl font-semibold mb-4">Your Classes</h2>
            {userClasses.length === 0 ? (
                <p className="text-gray-500">You are not enrolled in any classes yet.</p>
            ) : (
                <ul>
                {userClasses.map((classItem) => (
                    <li key={classItem.id} className="border-b py-2">
                    {classItem.course_name} – {classItem.course_date}
                    </li>
                ))}
                </ul>
            )}
          </div>
        )}
      </div>
    );
}

export default UserDashboard;
