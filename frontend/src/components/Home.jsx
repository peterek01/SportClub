import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from 'lucide-react';

function Home() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/courses/public")
            .then((res) => res.json())
            .then((data) => {
                setCourses(data)
            })

            .catch((err) => console.error("Error fetching courses:", err));
    }, []);

    return(
        <div className="relative w-full lg:max-w-7xl flex flex-col items-center justify-center bg-gray-100 p-6">
            <nav className="flex justify-between items-center mb-16 fixed top-5 left-5 right-5 border-b border-gray-300 bg-white/80 backdrop-blur-md shadow-sm px-5 py-3 z-50">
                <video
                    autoPlay
                    muted
                    playsInline
                    className="w-28 h-28 rounded-full">
                    <source src="/images/animlogo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <h1 className="text-4xl font-bold text-center">Welcome in our Sport Club<br></br>"PowerPlay"!</h1>
                <div className="space-x-1">
                    <Link to="/login">
                        <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow transition" title="Log in">
                            <LogIn size={20} />
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 shadow transition" title="Register">
                            <UserPlus size={20} />
                        </button>
                    </Link>
                </div>
            </nav>
            <p className="text-2xl text-gray-700 text-center max-w-5xl m-48 mb-10">Our sports club offers a wide range of sports activities for all levels of advancement. Choose your favorite discipline and join us!</p>

            <div className="w-full max-w-7xl mx-auto p-6">
                <h2 className="text-3xl font-semibold text-center mb-8">Available Courses</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {courses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-sm flex flex-col items-center text-center"
                    >
                        {/* Zdjęcie kursu */}
                        <img
                        src={`/images/${course.name.toLowerCase()}.jpg`}
                        alt={course.name}
                        className="w-full h-48 object-cover"
                        />

                        {/* Treść kursu */}
                        <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-blue-700">{course.name}</h3>
                        <p className="text-gray-700 text-sm text-justify">{course.description}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>


            <div className="text-center text-gray-800 mb-8">
                <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
                <p>Email: contact@sportclub.com</p>
                <p>Phone: +49 157456789</p>
                <p>Location: Sportstr. 10, 37123 Berlin</p>
            </div>
        </div>
    );
}

export default Home;