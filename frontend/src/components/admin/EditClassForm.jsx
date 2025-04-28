import { useState } from "react";
import API_BASE_URL from "../../api/api";

function EditClassForm({ classItem, courseId, onSuccess, onCancel }) {
    if (!classItem) return null;

    const [formData, setFormData] = useState({
        day_of_week: classItem.day_of_week || '',
        time: classItem.time || '',
        location: classItem.location || '',
        trainer: classItem.trainer || '',
        available_spots: classItem.available_spots || '',
      });

    // const [loading, setLoading] = useState(false);


    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/classes/${classItem.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update class");
            }

            onSuccess();

            // setLoading(true);
            // setTimeout(() => {
            //     setLoading(false);
            //     onSuccess();
            // }, 2000);

        } catch (error) {
            console.error("Update class error:", error);
            window.alert("Failed to update class.");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md mt-4">
                <h2 className="text-xl font-semibold mb-4">Edit Class</h2>

                <select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                >
                    <option value="" disabled>Select a day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
                <input 
                    type="text"
                    name="time"
                    placeholder="Time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full p-2 mb-2 border rounded"
                />
                <input 
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full p-2 mb-2 border rounded"
                />
                <input 
                    type="text"
                    name="trainer"
                    placeholder="Trainer"
                    value={formData.trainer}
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
                <div className="flex gap-2">
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    💾 Save
                    </button>
                    <button type="button" onClick={onCancel} className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500">
                    ✖ Cancel
                    </button>
                </div>
            </form>
        </>
    );
}

export default EditClassForm;