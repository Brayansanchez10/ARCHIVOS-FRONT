import React, { useState, createContext, useContext, useEffect } from 'react';
import { 
    getAllCourses as getAllCoursesApi, 
    getCourse as getCourseApi, 
    createCourse as createCourseApi, 
    updateCourse as updateCourseApi, 
    deleteCourse as deleteCourseApi,
    getCoursesByCategory as getCoursesByCategoryApi
} from '../../api/courses/course.request'; // Importa las funciones de tu archivo api

export const CoursesContext = createContext();

export const useCoursesContext = () => {
    const context = useContext(CoursesContext);
    if (!context) {
        throw new Error("useCoursesContext debe ser usado dentro de CoursesProvider");
    }
    return context;
};

export const CoursesProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);

    const getAllCourses = async () => {
        try {
            const res = await getAllCoursesApi();
            setCourses(res.data);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const getCourse = async (id) => {
        try {
            const res = await getCourseApi(id);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const createCourse = async ({ title, description, category,  image }) => {
        try {
            const newCourseData = {
                title,
                description,
                category,              
                image
            };
            console.log(newCourseData);
    
            const res = await createCourseApi(newCourseData);
            setCourses([...courses, res.data]);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const getCoursesByCategory = async (categoryName) => {
        try {
            const res = await getCoursesByCategoryApi(categoryName);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const updateCourse = async (id, title, description, category, content, image ) => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('content', content);

            if (image) {
                formData.append('image', image);
            }
            console.log(formData)
            const res = await updateCourseApi(id, formData);
            console.log(res)
            setCourses(courses.map(course => (course.id === id ? res.data : course)));
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const deleteCourse = async (id) => {
        try {
            await deleteCourseApi(id);
            setCourses(courses.filter(course => course.id !== id));
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    useEffect(() => {
        getAllCourses();
    }, []);

    return (
        <CoursesContext.Provider value={{ courses, getAllCourses, getCourse, createCourse, getCoursesByCategory, updateCourse, deleteCourse }}>
            {children}
        </CoursesContext.Provider>
    );
};
