import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import { useUserContext } from '../../context/user/user.context';
import { useAuth } from '../../context/auth.context';

const CoursesComponent = () => {
    const { user } = useAuth();
    const { getUserCourses } = useUserContext();
    const [userCourses, setUserCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserCourses = async () => {
            if (user && user.data && user.data.id) {
                try {
                    const courses = await getUserCourses(user.data.id);
                    setUserCourses(courses);
                } catch (error) {
                    console.error('Error al obtener los cursos del usuario:', error);
                }
            }
        };

        fetchUserCourses();
    }, [user, getUserCourses]);

    const handleCourseClick = (courseId) => {
        console.log("Course ID:", courseId);
        navigate(`/course/${courseId}`);
    };

    return (
        <div className="bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 min-h-screen overflow-hidden">
            <NavigationBar />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:mt-24 max-w-screen-xl mx-auto">
                {userCourses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white p-4 rounded-lg shadow-md border-black border cursor-pointer"
                        onClick={() => handleCourseClick(course._id)}
                    >
                        <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded shadow-lg border border-black" />
                        <div className="p-4 shadow-lg shadow-blue-700 bg-gray-400 border border-black">
                            <h3 className="text-lg font-semibold">{course.title}</h3>
                            <p className="text-sm mt-2">{course.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursesComponent;
