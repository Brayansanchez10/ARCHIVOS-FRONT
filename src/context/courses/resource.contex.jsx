// ResourceContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
    getResource as getResourceApi,
    createResource as createResourceApi,
    updateResource as updateResourceApi,
    deleteResource as deleteResourceApi,
    getAllResources as getAllResourcesApi,
    getResourceUser as getResourceUserApi
} from "../../api/courses/resource.request.js"; // Importamos las funciones de Resource.request

// Crear el contexto
const ResourceContext = createContext();

// Hook para usar el contexto
export const useResourceContext = () => {
    const context = useContext(ResourceContext);
    if (!context) {
        throw new Error("useResourceContext debe ser usado dentro de ResourceProvider");
    }
    return context;
};

// Proveedor del contexto
export const ResourceProvider = ({ children }) => {
    const [resources, setResources] = useState([]);

    // Función para obtener todos los recursos: 
    const getAllResources = async () => {
        try {
            const res = await getAllResourcesApi();
            setResources(res.data);
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };


    
    //Función para obtener un recurso Vista User
    const getResourceUser = async (id) => {
        try {
            const res = await getResourceUserApi(id);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    
    // Función para obtener un recurso registrado al courseId
    const getResource = async (courseId) => {
        try {
            // Llamar a la API pasando el courseId
            const res = await getResourceApi(courseId);
            // Actualizar el estado con los datos obtenidos
            setResources(res.data);
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error("Error al obtener recursos:", error);
            return null;
        }
    };

    // Función para crear un recurso
    const createResource = async ({ courseId, title, subcategoryId, description, file, link, quizzes }) => {
        try {
            const newResource = {
                courseId, 
                title,
                subcategoryId,
                description,
                file,
                link,
                quizzes // Añadir quizzes al nuevo recurso
            };
            console.log(newResource);

            const res = await createResourceApi(newResource);
            setResources([...resources, res.data]);
            return res.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    // Función para actualizar un recurso
    const updateResource = async (id, { title, subcategoryId, description, file, link, quizzes }) => {
        try {
            const resourceData = {
                title,
                subcategoryId,
                description,
                file,
                link,
                quizzes // Incluir quizzes en la actualización
            };

            const res = await updateResourceApi(id, resourceData);
            setResources(prevResources =>
                prevResources.map(resource =>
                    resource.id === id ? res.data : resource
                )
            );
            return res.data;
        } catch (error) {
            console.error("Error al actualizar recurso:", error);
            throw error;
        }
    };

    // Función para eliminar un recurso
    const deleteResource = async (id) => {
        try {
            await deleteResourceApi(id);
            setResources(prevResources =>
                prevResources.filter(resource => resource.id !== id)
            );
        } catch (error) {
            console.error("Error al eliminar recurso:", error);
            throw error;
        }
    };

    useEffect(() => {
        // Obtener los recursos al montar el componente
        getAllResources();
    }, []);

    return (
        <ResourceContext.Provider value={{ resources, getResource, createResource, updateResource, deleteResource, getResourceUser  }}>
            {children}
        </ResourceContext.Provider>
    );
};
