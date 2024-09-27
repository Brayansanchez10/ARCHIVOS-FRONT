import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HoverCard from "../Cards/HoverCard";
import NavigationBar from "../NavigationBar";
import { useCoursesContext } from "../../../context/courses/courses.context";
import { useTranslation } from "react-i18next";
import { AiOutlineClockCircle } from "react-icons/ai";
import { MdPlayCircleOutline } from "react-icons/md";
import { FaRegChartBar, FaSearch } from "react-icons/fa";
import '../../../css/Style.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Footer from "../../footer.jsx";

const AllCourses = () => {
  const { t } = useTranslation("global");
  const { courses } = useCoursesContext();
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [userCourses, setUserCourses] = useState(() => {
    const saved = localStorage.getItem('userCourses');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('userCourses', JSON.stringify(userCourses));
  }, [userCourses]);

  const handleCardClick = (course) => {
    setSelectedCourse(course);
    setIsConfirmModalOpen(true);
  };

  const handleFavoriteToggle = (courseId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(courseId)) {
        return prevFavorites.filter(id => id !== courseId);
      } else {
        return [...prevFavorites, courseId];
      }
    });
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleRegister = () => {
    if (selectedCourse && !userCourses.includes(selectedCourse.id)) {
      setUserCourses(prevUserCourses => [...prevUserCourses, selectedCourse.id]);
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } else {
      alert("Ya estás inscrito en este curso.");
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCourseCard = (course) => (
    <HoverCard
      key={course.id}
      title={course.title}
      description={course.description}
      ruta={course.image}
      creatorName={course.instructor || "Instructor Desconocido"}
      rating={course.rating || 4}
      duration="6 horas"
      lessons="12 lecciones"
      onClick={() => handleCardClick(course)}
      onFavoriteToggle={() => handleFavoriteToggle(course.id)}
      isFavorite={favorites.includes(course.id)}
    />
  );

  const favoriteCourses = filteredCourses.filter(course => favorites.includes(course.id));
  const categorizedCourses = filteredCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col mt-16 bg-gray-100">
      <NavigationBar />

      <div className="flex flex-col sm:flex-row justify-between mt-6 mx-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-4xl font-bold text-black text-center sm:text-left font-bungee">
            {t('courseComponent.title')}
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

      <div className="mt-8">
        <h2 className="text-[20px] font-bold text-gray-800 font-bungee text-center lg:text-left ml-4 lg:ml-60">
          {t('courseComponent.favorites')}
        </h2>
        {favoriteCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-6 mx-auto max-w-7xl place-items-center">
            {favoriteCourses.map(renderCourseCard)}
          </div>
        ) : (
          <div className="flex justify-center items-center mt-4">
            <p className="text-center text-gray-500">
              {t("courseComponent.desFavorites")}
            </p>
          </div>
        )}
      </div>
      {Object.entries(categorizedCourses).map(([category, coursesInCategory]) => (
        <div key={category}>
          <div className="text-[20px] font-bold text-gray-800 font-bungee text-center lg:text-left ml-4 lg:ml-60 mt-14">
            <Link to={`/CourseCategory/${encodeURIComponent(category)}`} className="hover:text-blue-600 transition-colors duration-200">
              <h2 className="text-[20px] font-bold text-gray-800 font-bungee">
                {category}
              </h2>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-6 mx-auto max-w-7xl place-items-center mb-16">
            {coursesInCategory.map(renderCourseCard)}
          </div>
        </div>
      ))}

      {isConfirmModalOpen && selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-4"
          onClick={closeConfirmModal}
        >
          <div className="bg-white rounded-lg shadow-lg w-[300px] p-4 relative" onClick={(e) => e.stopPropagation()}>
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
                  Con <strong>Daniel Gomez</strong>
                </p>
              </div>
            </div>
            <p className="text-[#676B70] text-[15px] font-regular mb-2">
              {selectedCourse.description}
            </p>
            <div className="mb-4 text-[14px] mt-3">
              {["Item prueba numero 1", "Item prueba numero 2", "Item prueba numero 3"].map((item, index) => (
                <div key={index} className="flex items-center mb-1">
                  <span className="text-[#939599] mr-2">✓</span>
                  <span className="text-[#939599]">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <div className="flex flex-col text-[#939599] text-[12px]">
                <div className="flex items-center mt-1">
                  <AiOutlineClockCircle className="mr-1" />
                  <span>6 horas</span>
                </div>
                <div className="flex items-center mt-1">
                  <MdPlayCircleOutline className="mr-1" />
                  <span>12 lecciones</span>
                </div>
                <div className="flex items-center mt-1">
                  <FaRegChartBar className="mr-1" />
                  <span>Principiante</span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                className={`bg-[#783CDA] text-white font-bold text-[13px] rounded-[5px] shadow-md px-3 !py-1 ${userCourses.includes(selectedCourse.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={userCourses.includes(selectedCourse.id)}
              >
                {userCourses.includes(selectedCourse.id) ? "YA REGISTRADO!" : "INSCRÍBETE!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-4"
          onClick={closeSuccessModal}
        >
          <div className="bg-white rounded-lg shadow-lg w-[300px] p-4 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeSuccessModal}
              className="absolute top-2 right-2 text-black hover:text-gray-600"
            >
              X
            </button>
            <h2 className="text-center font-bold text-lg mb-4">¡Éxito!</h2>
            <p className="text-center">Te has registrado en el curso exitosamente.</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AllCourses;