import { useState } from "react";

function EditCourseForm({ course, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: course.name || "",
        description: course.description || "",
        available_spots: course.available_spots || 0,
    });

    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/courses/${course.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to update course");

            window.alert("Course updated!");
            onSuccess();
        } catch (error) {
            console.error("Update course error:", error);
            window.alert("Failed to update course.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md mt-4">
            <h2 className="text-xl font-semibold mb-4">Edit Course</h2>

            <input 
                type="text"
                name="name"
                placeholder="Course Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 mb-2 border rounded"
            />
            <input 
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-2 mb-2 border rounded"
            />
            <input 
                type="number"
                name="available_spots"
                placeholder="Available Spots"
                value={formData.available_spots}
                onChange={handleChange}
                required
                className="w-full p-2 mb-2 border rounded"
            />

            <div className="flex space-x-4">
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
            </div>
        </form>
    );
}

export default EditCourseForm;