import { useEffect, useState } from "react";
import useTokenExpiry from "../hooks/useTokenExpiry";
import { logout } from "../utils/logout";
import { useNavigate } from "react-router-dom";
import useRole from "../hooks/useRole";
import AddCourseForm from "./admin/AddCourseForm";
import EditCourseForm from "./admin/EditCourseForm";
import AddClassForm from "./admin/AddClassForm";
import CourseClasses from "./admin/CourseClasses";
import Modal from "./common/Modal";

function UserDashboard() {
  const token = useTokenExpiry();
  const [courses, setCourses] = useState([]);
  const [userClasses, setUserClasses] = useState([]);
  // const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [addingClassCourseId, setAddingClassCourseId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [classToLeave, setClassToLeave] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const role = useRole();
  const navigate = useNavigate();

  const fetchCourses = () => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:5000/api/courses/public")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("Invalid data format:", data);
          setCourses([]);
        }
      })
      .catch((err) => {
        console.error("Fetch courses error:", err);
        setCourses([]);
      });
  };

  const fetchUserClasses = () => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:5000/api/auth/my-classes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch classes");
        return res.json();
      })
      .then((data) => setUserClasses(data))
      .catch((err) => console.error("Fetch classes error:", err));
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCourses();
    fetchUserClasses();
  }, [token, navigate]);

  const handleViewClasses = (courseId) => {
    setSelectedCourseId(courseId);
    setShowClassModal(true);
  };

  const handleCloseClasses = () => {
    setSelectedCourseId(null);
    setShowClassModal(false);
  };

  const confirmDeleteCourse = (courseId) => {
    setCourseToDelete(courseId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/courses/${courseToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete course");
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      console.error("Delete course error:", error);
    }
  };

  const handleLeaveClass = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/classes/${classToLeave}/leave`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to leave class");
      }
  
      setShowLeaveModal(false);
      setClassToLeave(null);
      fetchUserClasses(); // odśwież dane
    } catch (error) {
      console.error("Leave class error:", error);
    }
  };  

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("Failed to delete account");
  
      localStorage.clear();
      navigate("/home");
  
    } catch (err) {
      console.error("Delete account error", err);
      window.alert("Could not delete your account.");
    }
  };
  

  if (!token) return <div>Redirecting...</div>;

  return (
    (role === "user" || role === "admin") && (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
          <h1 className="text-3xl font-bold text-blue-600">
            {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            {role === "admin" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ➕ Add New Course
              </button>
            )}
          </div>

          <Modal
            isOpen={showDeleteAccountModal}
            onClose={() => setShowDeleteAccountModal(false)}
            title="Confirm Account Deletion"
          >
            <p className="mb-4 text-red-600 font-medium">
              Are you sure you want to delete your account? This action is irreversible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Account
              </button>
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </Modal>


          <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Add New Course">
            <AddCourseForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchCourses();
              }}
            />
          </Modal>

          <div className="grid gap-4"
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
            }}
            >
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white shadow-md rounded p-4 flex flex-col justify-between"
              >
                {/* GÓRNA BELKA */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-blue-700">{course.name}</h3>
                  {role === "admin" && (
                    <button
                      onClick={() => setAddingClassCourseId(course.id)}
                      className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ➕ Add Class
                    </button>
                  )}
                </div>

                <div className="flex flex-col h-full">
                  <p className="flex-grow text-sm text-gray-700 mb-3 text">{course.description}</p>

                  <div className="flex justify-between items-center text-sm">
                    <span>Classes: {course.class_count}</span>
                    <button
                      onClick={() => handleViewClasses(course.id)}
                      className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      ➡️ See classes
                    </button>
                  </div>

                  <p className="mt-2 text-sm font-medium">
                    Available spots: {course.total_available_spots}
                  </p>
                </div>
                  
                {role === "admin" && (
                  <div className="mt-auto pt-3 flex justify-between gap-9">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => confirmDeleteCourse(course.id)}
                      className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ❌ Delete
                    </button>
                  </div>
                )}

                {/* MODALE */}
                {addingClassCourseId === course.id && (
                  <Modal isOpen onClose={() => setAddingClassCourseId(null)} title="Add Class">
                    <AddClassForm
                      courseId={course.id}
                      onSuccess={() => {
                        setAddingClassCourseId(null);
                        fetchCourses();
                      }}
                      onCancel={() => setAddingClassCourseId(null)}
                    />
                  </Modal>
                )}

                {editingCourse?.id === course.id && (
                  <Modal isOpen onClose={() => setEditingCourse(null)} title="Edit Course">
                    <EditCourseForm
                      course={editingCourse}
                      onSuccess={() => {
                        setEditingCourse(null);
                        fetchCourses();
                      }}
                      onCancel={() => setEditingCourse(null)}
                    />
                  </Modal>
                )}
              </div>
            ))}
          </div>


          {addingClassCourseId !== null && (
            <Modal
              isOpen={true}
              onClose={() => setAddingClassCourseId(null)}
              title="Add New Class"
            >
              <AddClassForm
                courseId={addingClassCourseId}
                onSuccess={() => {
                  setAddingClassCourseId(null);
                  fetchCourses();
                }}
                onCancel={() => setAddingClassCourseId(null)}
              />
            </Modal>
          )}

          <Modal
            isOpen={!!editingCourse}
            onClose={() => setEditingCourse(null)}
            title="Edit Course"
          >
            {editingCourse && (
              <EditCourseForm
                course={editingCourse}
                onSuccess={() => {
                  setEditingCourse(null);
                  fetchCourses();
                }}
                onCancel={() => setEditingCourse(null)}
              />
            )}
          </Modal>

          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Confirm Deletion"
          >
            <p className="mb-4">Are you sure you want to delete this course?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </Modal>

          {showClassModal && selectedCourseId && (
            <Modal isOpen={showClassModal} onClose={handleCloseClasses} title="Course Classes">
              <CourseClasses
                courseId={selectedCourseId}
                allowJoin={true}
                onClose={handleCloseClasses}
                refreshUserClasses={fetchUserClasses}
              />
            </Modal>
          )}
        </div>

        {role === "user" && (
          <div className="bg-white mt-10 p-6 shadow-md rounded">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">Your Enrolled Classes:</h2>
            {userClasses.length === 0 ? (
              <p className="text-gray-500">You are not enrolled in any classes yet.</p>
            ) : (
              <ul className="space-y-4">
                {userClasses.map((classItem) => (
                  <li key={classItem.id} className="border p-4 rounded-md bg-gray-50 shadow-sm text-left">
                    <p><strong>Course: </strong>{classItem.course_name}</p>
                    <p>
                      <strong>Day: </strong>{classItem.day_of_week} - 
                      <strong>Time: </strong>{classItem.time}
                    </p>
                    <p><strong>Location: </strong>{classItem.location}</p>
                    <p><strong>Trainer: </strong>{classItem.trainer}</p>
                    <button
                      onClick={() => {
                        setClassToLeave(classItem.id);
                        setShowLeaveModal(true);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ❌ Leave
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Modal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          title="Confirm Leave"
        >
          <p className="mb-4">Are you sure you want to leave this class?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleLeaveClass}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Leave
            </button>
            <button
              onClick={() => setShowLeaveModal(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {role === "user" && (
          <div className="flex m-4 justify-center mt-6">
            <button 
              onClick={() => setShowDeleteAccountModal(true)} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete My Account
            </button>
          </div>
        )}
      </div>
    )
  );
}

export default UserDashboard;
