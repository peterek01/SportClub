import { useState } from "react";
import API_BASE_URL from "../../api/api";

function AddClassForm({ courseId, onSuccess }) {
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        day_of_week: '',
        time: '',
        location: '',
        trainer: '',
        available_spots: '',
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
            const response = await fetch(`${API_BASE_URL}/courses/${courseId}/classes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    day_of_week: formData.day_of_week,
                    time: formData.time,
                    location: formData.location,
                    trainer: formData.trainer,
                    available_spots: parseInt(formData.available_spots, 10),
                }),
            });

            if (!response.ok) throw new Error("Failed to add class");

            setSuccessMessage("Class added successfully!");
            setErrorMessage("");
            setTimeout(() => {
                setSuccessMessage("");
                onSuccess();  // zamknie modal i odświeży dane
            }, 1500);

            // onSuccess();
        } catch (error) {
            console.error("Add class error", error);
            setErrorMessage("Failed to add class. Please try again later.");
        }
    };

    return (
        <div>
          {successMessage ? (
            <p className="text-green-600 text-center text-lg">{successMessage}</p>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md mt-4 space-y-4">
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      
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
                type="time"
                name="time"
                placeholder="Time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="trainer"
                placeholder="Trainer"
                value={formData.trainer}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="available_spots"
                placeholder="Available Spots"
                value={formData.available_spots}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-2 justify-end">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  ➕ Add Class
                </button>
              </div>
            </form>
          )}
        </div>
      );
      
}

export default AddClassForm;