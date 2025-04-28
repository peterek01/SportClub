import { useEffect, useState } from "react";
import useRole from "../../hooks/useRole";
import EditClassForm from "./EditClassForm";
import Modal from "../common/Modal";
import API_BASE_URL from "../../api/api";

function CourseClasses({ courseId, courseName, allowJoin = false, onClose, refreshUserClasses }) {
    const [classes, setClasses] = useState([]);
    const [userClasses, setUserClasses] = useState([]);
    const [error, setError] = useState("");
    const [editingClass, setEditingClass] = useState(null);
    const [classToDelete, setClassToDelete] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [expandedClassId, setExpandedClassId] = useState(null);
    const [membersByClassId, setMembersByClassId] = useState({});
    const role = useRole();

    const fetchMembers = async (classId) => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API_BASE_URL}/api/classes/${classId}/members`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (!res.ok) throw new Error("Failed to fetch members");
          const data = await res.json();
          setMembersByClassId((prev) => ({ ...prev, [classId]: data }));
          setExpandedClassId(classId);
        } catch (err) {
          console.error("Fetch members error:", err);
        }
      };
      
      const hideMembers = () => setExpandedClassId(null);

    useEffect(() => {
        fetchClasses();
        fetchUserJoinedClasses();
    }, [courseId]);

    const fetchClasses = () => {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/api/courses/${courseId}/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setClasses(data))
          .catch((err) => console.error("Fetch classes error:", err));
    };

    const fetchUserJoinedClasses = () => {
        const token = localStorage.getItem("token");
      
        fetch(`${API_BASE_URL}/api/auth/my-classes`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setUserClasses(data))
          .catch((err) => console.error("Fetch user classes error:", err));
      };
      

    const handleJoinClass = async (classId) => {
        const token = localStorage.getItem("token");
      
        try {
          const res = await fetch(`${API_BASE_URL}/api/classes/${classId}/join`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          const data = await res.json(); // <== PRZED sprawdzeniem res.ok
      
          if (!res.ok) {
            if (data?.error === "You are already registered in this class.") {
              setError("You are already registered in this class.");
            } else if (data?.error === "No available spots in this class") {
              setError("No available spots in this class.");
            } else {
              setError("Could not join class.");
            }
      
            setTimeout(() => setError(""), 2000);
            return;
          }
      
          setShowSuccess(true);

          setTimeout(() => {
            setShowSuccess(false);
            if (typeof onClose === "function") onClose();
            if (typeof refreshUserClasses === "function") refreshUserClasses(); // refresh user data
          }, 1500);
        } catch (err) {
          console.error("Join class error:", err);
          setError("Could not join class.");
          setTimeout(() => setError(""), 2000);
        }
    };

  const handleDeleteClass = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/courses/${courseId}/classes/${classToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete class");

      setClassToDelete(null);
      setShowSuccess(true);
      fetchClasses();

      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleEditSuccess = () => {
    setEditingClass(null);
    setShowSuccess(true);
    fetchClasses();

    setTimeout(() => {
      setShowSuccess(false);
    }, 1500);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">{courseName}</h2>

      {error && <p className="text-red-500">{error}</p>}
      {showSuccess && <p className="text-green-500">Action completed successfully!</p>}

      <ul className="space-y-4">
        {classes.map((classItem) => (
            <li key={classItem.id} className="border p-3 rounded-md shadow-sm bg-gray-50">
            <p>📅 <strong>Time:</strong> {classItem.day_of_week} – 🕒 {classItem.time}</p>
            <p>📍 <strong>Location:</strong> {classItem.location}</p>
            <p>🧑‍🏫 <strong>Trainer:</strong> {classItem.trainer}</p>
            <p>
                <strong>Available Spots:</strong> {classItem.available_spots}/{classItem.total_max_spots}
                {role === "admin" && (
                    <button
                    onClick={() =>
                        expandedClassId === classItem.id ? hideMembers() : fetchMembers(classItem.id)
                    }
                    className="ml-3 text-sm text-blue-600 hover:underline"
                    >
                    {expandedClassId === classItem.id ? "Hide list" : "See members"}
                    </button>
                )}
            </p>


            {/* USER: show join button */}
            {allowJoin && role === "user" && (
                <button
                onClick={() => handleJoinClass(classItem.id)}
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                ✅ Join
                </button>
            )}

            {/* ADMIN: show edit and delete buttons */}
            {role === "admin" && (
                <div className="mt-2 space-x-2">
                <button
                    onClick={() => setEditingClass(classItem)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={() => setClassToDelete(classItem)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    ❌ Delete
                </button>
                </div>
            )}
            {expandedClassId === classItem.id && membersByClassId[classItem.id] && (
                <div className="mt-2 p-3 bg-white border rounded">
                    <h4 className="font-semibold text-gray-700 mb-2">Class Members:</h4>
                    {membersByClassId[classItem.id].length === 0 ? (
                    <p className="text-sm text-gray-500">No users enrolled.</p>
                    ) : (
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                        {membersByClassId[classItem.id].map((user) => (
                        <li key={user.id}>{user.first_name} {user.last_name}</li>
                        ))}
                    </ul>
                    )}
                </div>
            )}
            </li>
        ))}
        </ul>

      {/* Edit modal */}
      <Modal isOpen={!!editingClass} onClose={() => setEditingClass(null)} title="Edit Class">
        {editingClass && (
          <EditClassForm
            classItem={editingClass}
            courseId={courseId}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingClass(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!classToDelete} onClose={() => setClassToDelete(null)} title="Confirm Deletion">
        <p className="mb-4">Are you sure you want to delete this class?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleDeleteClass}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => setClassToDelete(null)}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CourseClasses;
