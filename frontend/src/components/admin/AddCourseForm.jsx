import { useState } from "react";

function AddCourseForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/courses/", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                setSuccess(true);
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Failed to add course. Please try again later.");
        }
    };

    return (
        <>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-500 mb-2">Course Added</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text"
                    name="name"
                    placeholder="Course Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                ></textarea>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    ➕ Add Course
                </button>
            </form>
        </>
    );
}

export default AddCourseForm;
