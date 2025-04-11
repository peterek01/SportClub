import { useState } from "react";

function AddClassForm({ courseId, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        date: '',
        location: '',
        trainer: '',
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
            const response = await fetch(`http://127.0.0.1:5000/api/courses/${courseId}/classes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to add class");

            window.alert("Class added!");
            onSuccess();
        } catch (error) {
            console.error("Add class error", error);
            window.alert("Failed to add class.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md mt-4">
            <h2 className="text-xl font-semibold mb-4">Add New Class</h2>

            <input
                type="datetime-local"
                name="date"
                value={formData.date}
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

            <div className="flex space-x-4">
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
            </div>
        </form>
    );
}

export default AddClassForm;