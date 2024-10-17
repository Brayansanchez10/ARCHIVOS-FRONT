import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import HoverCard from "../Cards/HoverCard";
import NavigationBar from "../NavigationBar";
import { useCoursesContext } from "../../../context/courses/courses.context";
import { useUserContext } from "../../../context/user/user.context";
import { useRatingsContext } from "../../../context/courses/ratings.context";
import { useAuth } from "../../../context/auth.context";
import { useFavorite } from "../../../context/courses/favorites.context";
import { useTranslation } from "react-i18next";
import { AiOutlineClockCircle } from "react-icons/ai";
import { MdPlayCircleOutline } from "react-icons/md";
import { FaRegChartBar, FaSearch } from "react-icons/fa";
import '../../../css/Style.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Footer from "../../footer";
import { getSubCategoryCourseId } from "../../../api/courses/subCategory.requst.js";

export default function Component() {
  const { category } = useParams();
  const { t } = useTranslation("global");
  const { courses } = useCoursesContext();
  const { ratings, fetchRatingsByCourse } = useRatingsContext();
  const { user } = useAuth();
  const { registerToCourse, getUserCourses, getUserById } = useUserContext();
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorite();
  const [userCourses, setUserCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allRatings, setAllRatings] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [creators, setCreators] = useState({});

  const fetchCreatorName = useCallback(async (userId) => {
    if (!creators[userId]) {
      try {
        const creatorData = await getUserById(userId);
        setCreators(prev => ({ ...prev, [userId]: creatorData }));
      } catch (error) {
        console.error("Error fetching creator name:", error);
      }
    }
  }, [getUserById, creators]);

  useEffect(() => {
    const loadRatings = async () => {
      const newAllRatings = [];
      for (const course of courses) {
        const courseRatings = await fetchRatingsByCourse(course.id);
        newAllRatings.push(courseRatings);
        fetchCreatorName(course.userId);
      }
      setAllRatings(newAllRatings);
    };
  
    loadRatings();
  }, [courses, fetchRatingsByCourse, fetchCreatorName]);

  const calculateAverageRating = (courseId) => {
    const courseRatings = ratings.filter(rating => rating.courseId === courseId);
    if (courseRatings.length === 0) return 0;
  
    const sumRatings = courseRatings.reduce((sum, rating) => sum + (rating.score || 0), 0);
    return (sumRatings / courseRatings.length).toFixed(1);
  };

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (user && user.data && user.data.id) {
        try {
          const courses = await getUserCourses(user.data.id);
          setUserCourses(courses);
        } catch (error) {
          console.error("Error fetching user courses:", error);
          setError(
            "No se pudieron cargar tus cursos. Por favor, intenta de nuevo más tarde."
          );
        }
      }
    };
    fetchUserCourses();
  }, [user, getUserCourses]);

  const handleCardClick = async (course) => {
    setSelectedCourse(course);
    try {
      const response = await getSubCategoryCourseId(course.id);
      setSubCategories(response.data);
    } catch (error) {
      console.error("Error al obtener las subcategorías del curso:", error);
      setSubCategories([]);
    }
    setIsConfirmModalOpen(true);
  };

  const handleFavoriteToggle = async (courseId) => {
    await toggleFavorite(courseId);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleRegister = async () => {
    if (
      selectedCourse &&
      !userCourses.some((course) => course.id === selectedCourse.id)
    ) {
      setIsLoading(true);
      setError(null);
      try {
        await registerToCourse(user.data.id, selectedCourse.id);
        const updatedCourses = await getUserCourses(user.data.id);
        setUserCourses(updatedCourses);
        setIsConfirmModalOpen(false);
        setIsSuccessModalOpen(true);
      } catch (error) {
        console.error("Error al inscribir al usuario en el curso:", error);
        setError(
          "Hubo un error al inscribirte en el curso. Por favor, intenta de nuevo."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Ya estás inscrito en este curso.");
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const filteredCourses = courses.filter(course => 
    course.category === decodeURIComponent(category) &&
    (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderCourseCard = (course) => {
    const averageRating = calculateAverageRating(course.id);
    const creator = creators[course.userId];

    return (
      <div className="flex justify-center items-center" key={course.id}>
        <HoverCard
          title={course.title}
          description={course.description}
          ruta={course.image}
          creatorName={creator ? creator.username : "Cargando..."}
          courseId={course.id}
          rating={averageRating || 0}
          duration={`${course.duracion} horas`}
          onClick={() => handleCardClick(course)}
          onFavoriteToggle={() => handleFavoriteToggle(course.id)}
          isFavorite={favorites.some(fav => fav.courseId === course.id)}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 mt-16">
      <NavigationBar />

      <div className="flex flex-col sm:flex-row justify-between mt-6 mx-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-4xl font-bold text-black text-center sm:text-left font-bungee">
            {decodeURIComponent(category)}
          </h1>
        </div>
        <div className="w-full md:w-auto">
          <div className="flex px-4 py-2 border bg-white border-gray-300 rounded-xl shadow-md">
            <FaSearch size={"18px"} className="mt-1 mr-2" />
            <input
              type="search"
              className="outline-none w-full md:w-[280px] lg:w-[360px] xl:w-[420px]"
              placeholder={t('coursesComponent.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl px-4 mb-16">
        {filteredCourses.map(renderCourseCard)}
      </div>

      {isConfirmModalOpen && selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-4"
          onClick={closeConfirmModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-[300px] p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeConfirmModal}
              className="absolute top-2 right-2 text-black hover:text-gray-600"
            >
              X
            </button>
            <div className="flex items-start mb-2">
              <img
                src={selectedCourse.image}
                alt={selectedCourse.title}
                className="w-[38px] h-[39.63px] rounded-lg shadow-sm"
              />
              <div className="ml-2">
                <h2 className="font-bold text-[#272C33] text-[15px]">
                  {selectedCourse.title}
                </h2>
                <p className="text-[#939599] text-[11px]">
                  Con <strong>{creators[selectedCourse.userId] ? creators[selectedCourse.userId].username : "Cargando..."}</strong>
                </p>
              </div>
            </div>
            <p className="text-[#676B70] text-[15px] font-regular mb-2">
              {selectedCourse.description}
            </p>
            <div className="mb-4 text-[14px] mt-3">
              {subCategories.map((subCategory, index) => (
                <div key={index} className="flex items-center mb-1">
                  <span className="text-[#939599] mr-2">✓</span>
                  <span className="text-[#939599]">{subCategory.title}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <div className="flex flex-col text-[#939599] text-[12px]">
                <div className="flex items-center mt-1">
                  <AiOutlineClockCircle className="mr-1" />
                  <span>{selectedCourse.duracion} horas</span>
                </div>
                <div className="flex items-center mt-1">
                  <MdPlayCircleOutline className="mr-1" />
                  <span>{subCategories.length} recursos</span>
                </div>
                <div className="flex items-center mt-1">
                  <FaRegChartBar className="mr-1" />
                  <span>{selectedCourse.nivel}</span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                className={`bg-[#783CDA] text-white font-bold text-[13px] rounded-[5px] shadow-md px-3 !py-1 ${
                  userCourses.some(
                    (course) => course.id === selectedCourse.id
                  ) || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  userCourses.some(
                    (course) => course.id === selectedCourse.id
                  ) || isLoading
                }
              >
                {isLoading
                  ? "Inscribiendo..."
                  : userCourses.some(
                      (course) => course.id === selectedCourse.id
                    )
                  ? "YA REGISTRADO!"
                  : "INSCRÍBETE!"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-4"
          onClick={closeSuccessModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-[300px] p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSuccessModal}
              className="absolute top-2 right-2 text-black hover:text-gray-600"
            >
              X
            </button>
            <h2 className="text-center font-bold text-lg mb-4">¡Éxito!</h2>
            <p className="text-center">
              Te has registrado en el curso exitosamente.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}