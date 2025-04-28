import { useState } from "react";
import API_BASE_URL from "../../api/api";

function EditCourseForm({ course, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: course?.name || "",
    description: course?.description || "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setErrorMessage("");
    // setSuccessMessage("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to update course");
      }

      setSuccessMessage("✅ Course updated successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error("Update course error:", err);
      setErrorMessage(err.message || "Failed to update course.");
    }
  };

  return (
    <div>
      {successMessage ? (
        <p className="text-green-600 text-center text-lg">{successMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
  
          <input
            type="text"
            name="name"
            placeholder="Course Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              ✖ Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              💾 Save
            </button>
          </div>
        </form>
      )}
    </div>
  );  
}

export default EditCourseForm;
