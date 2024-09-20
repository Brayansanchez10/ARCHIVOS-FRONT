import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useResourceContext } from "../../../context/courses/resource.contex";
import { useCoursesContext } from "../../../context/courses/courses.context";
import { useAuth } from "../../../context/auth.context";
import { Collapse } from "antd";
import { useUserContext } from "../../../context/user/user.context";
import NavigationBar from "../NavigationBar";
import { FiMenu, FiX } from "react-icons/fi"; // Importamos íconos de react-icons
import jsPDF from "jspdf";
import zorro from "../../../assets/img/Zorro.jpeg";
import derechaabajo from "../../../assets/img/DerechaAbajo.jpeg";
import izquierdaarriba from "../../../assets/img/IzquierdaArriba.jpeg";
import { Anothershabby_trial } from "../../../Tipografy/Anothershabby_trial-normal";
import Swal from 'sweetalert2';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;

const ResourceView = () => {
  const { t } = useTranslation("global");
  const { user } = useAuth();
  const { getUserById } = useUserContext();
  const [username, setUsername] = useState("");
  const { id } = useParams();
  const { getResourceUser, getResource } = useResourceContext();
  const { getCourse } = useCoursesContext();
  const [resource, setResource] = useState(null);
  const [resources, setResources] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Controlamos si el menú está abierto o no
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  // Fetch resource data on component mount or when `id` or `getResourceUser` changes
  useEffect(() => {
    const fetchResource = async () => {
      try {
        if (id && !resource) {
          const resourceData = await getResourceUser(id);
          setResource(resourceData);
          if (resourceData && resourceData.courseId) {
            setCourseId(resourceData.courseId);
          }
        } else if (!id) {
          setError("ID de recurso no proporcionado");
        }
      } catch (error) {
        console.error("Error al obtener la información del recurso:", error);
        setError("Error al obtener la información del recurso.");
      }
    };

    fetchResource();
  }, [id, getResourceUser, resource]); // Dependencias ajustadas

  // Fetch resources when `courseId` changes
  useEffect(() => {
    const fetchResources = async () => {
      try {
        if (courseId) {
          const resourceData = await getResource(courseId);
          setResources(resourceData);
        }
      } catch (error) {
        console.error("Error al obtener los recursos del curso:", error);
      }
    };

    fetchResources();
  }, [courseId]); // Dependencias ajustadas

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (courseId) {
          const courseData = await getCourse(courseId);
          setCourse(courseData);
        }
      } catch (error) {
        console.error("Error al obtener la información del curso:", error);
      }
    };

    fetchCourse();
  }, [courseId, getCourse]);

  // Fetch user data on component mount or when `user` or `getUserById` changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.data && user.data.id) {
        try {
          const userData = await getUserById(user.data.id);
          setUsername(userData.username);
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          setError("Error al obtener datos del usuario.");
        }
      }
    };

    fetchUserData();
  }, [user, getUserById]); // Dependencias ajustadas

  // Encuentra el índice del recurso actual en la lista de recursos
  useEffect(() => {
    if (resources.length > 0 && resource) {
      const index = resources.findIndex((r) => r._id === resource._id);
      setCurrentResourceIndex(index);
      updateProgress(index, resources.length);
    }
  }, [resources, resource]);

  // Actualiza el estado de si se ha seleccionado una respuesta
  useEffect(() => {
    setIsAnswerSelected(answers[currentQuestionIndex] !== undefined);
  }, [answers, currentQuestionIndex]);

  const isVideoLink = (url) => {
    return (
      url.includes("youtube.com/watch") ||
      url.includes("youtu.be/") ||
      url.includes("vimeo.com/") ||
      url.includes("drive.google.com/")
    );
  };

  const getEmbedUrl = (url) => {
    if (url.includes("youtu.be/") || url.includes("youtube.com/watch")) {
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1`;
      }
      const urlParams = new URLSearchParams(new URL(url).search);
      const videoId = urlParams.get("v");
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1`
        : "";
    } else if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1];
      return `https://player.vimeo.com/video/${videoId}?controls=1&background=0&byline=0&title=0&portrait=0&loop=0`;
    } else if (url.includes("drive.google.com/")) {
      const videoId = url.match(/[-\w]{25,}/); // Extrae el ID del archivo
      return videoId
        ? `https://drive.google.com/file/d/${videoId}/preview`
        : "";
    }
    return "";
  };

  const renderContent = (file) => {
    if (file) {
      if (isVideoLink(file)) {
        return (
          <div className="relative w-full h-full">
            {/* Contenedor del video */}
            <iframe
              title="Video"
              width="100%"
              height="100%"
              src={getEmbedUrl(file)}
              frameBorder="0"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            ></iframe>

            {/* Superposición de la imagen/logo */}
            <img
              src={izquierdaarriba}
              alt="Superposición Izquierda Arriba"
              className="absolute top-0 left-0 w-24 h-24 z-10"
            />
            <img
              src={izquierdaarriba}
              alt="Superposición Derecha Arriba"
              className="absolute top-0 right-0 w-24 h-24 z-10 rotate-90"
            />
          </div>
        );
      } else if (file.endsWith(".pdf")) {
        return (
          <iframe
            src={file}
            width="100%"
            height="100%"
            title="PDF Viewer"
            className="object-cover"
          ></iframe>
        );
      } else if (file.startsWith("http")) {
        return (
          <img
            src={file}
            alt="Contenido"
            className="w-1/2 h-auto object-cover"
          />
        );
      }
    }
    return <p>No hay contenido disponible</p>;
  };

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedAnswer,
    }));
  };

  const handleNextQuestion = () => {
    // Verificar si se ha seleccionado una respuesta antes de continuar
    if (!answers[currentQuestionIndex]) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor selecciona una respuesta antes de continuar.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    // Si es la última pregunta, finaliza el quiz
    if (currentQuestionIndex === (resource?.quizzes.length || 0) - 1) {
      const correctCount = Object.keys(answers).filter(
        (index) => resource?.quizzes[index]?.correctAnswer === answers[index]
      ).length;
      const incorrectCount = Object.keys(answers).length - correctCount;
  
      setCorrectAnswers(correctCount);
      setIncorrectAnswers(incorrectCount);
      setIsQuizCompleted(true);
    } else {
      setCurrentQuestionIndex((prevIndex) =>
        Math.min(prevIndex + 1, (resource?.quizzes.length || 0) - 1)
      );
      setError(null); // Limpiar el mensaje de error
    }
  };

  const handleRetakeQuiz = () => {
    // Reiniciar el estado del cuestionario
    setAnswers({}); // Vacía las respuestas
    setCurrentQuestionIndex(0); // Vuelve a la primera pregunta
    setCorrectAnswers(0); // Reinicia el contador de respuestas correctas
    setIncorrectAnswers(0); // Reinicia el contador de respuestas incorrectas
    setIsQuizCompleted(false); // Restablece el estado de quiz completado
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const renderQuiz = () => {
    const question = resource.quizzes[currentQuestionIndex];
  
    return (
      <div className="quiz-container bg-white rounded-xl shadow-lg border border-gray-300 w-full p-6 mx-auto my-10">
        <h2 className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-xl text-white text-2xl font-semibold text-center">
          Pregunta {currentQuestionIndex + 1}/{resource?.quizzes.length || 0}
        </h2>
        <h3 className="font-semibold mb-6 text-center text-xl text-gray-800 mt-3">
          {question.question}
        </h3>

        {question.options.map((option, index) => (
          <div key={index} className="flex items-center mb-4 mx-auto w-11/12">
            <input
              type="radio"
              id={`question-${currentQuestionIndex}-option-${index}`}
              name={`question-${currentQuestionIndex}`}
              value={option}
              checked={answers[currentQuestionIndex] === option}
              onChange={() => handleAnswerChange(currentQuestionIndex, option)}
              className="hidden" // Mantén el input oculto
            />
            <label
              htmlFor={`question-${currentQuestionIndex}-option-${index}`}
              className={`flex-1 py-3 px-4 rounded-lg border text-lg cursor-pointer transition-colors 
              ${
                answers[currentQuestionIndex] === option
                  ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-200"
              } 
              ${
                isQuizCompleted && question.correctAnswer === option
                  ? "border-green-500 bg-green-100 text-green-700"
                  : isQuizCompleted &&
                    answers[currentQuestionIndex] === option &&
                    answers[currentQuestionIndex] !== question.correctAnswer
                  ? "border-red-500 bg-red-100 text-red-700"
                  : ""
              }`}
            >
              {option}
            </label>
          </div>
        ))}

        <div className="flex justify-between mt-8 mx-5">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition-all 
            ${
              currentQuestionIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Anterior
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={!isAnswerSelected}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              isAnswerSelected
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentQuestionIndex === (resource?.quizzes.length || 0) - 1
              ? "Finalizar"
              : "Siguiente"}
          </button>
        </div>
      </div>
    );
  };

  const renderQuizSummary = () => {
    return (
      <div className="quiz-summary bg-white p-6 rounded-xl shadow-lg border border-gray-300 w-full max-w-md mx-auto text-center my-10">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          Quiz Finalizado
        </h3>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FaQuestionCircle className="text-gray-500 text-3xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-medium text-gray-700">Preguntas Totales</span>
              <span className="text-lg text-gray-600">{resource?.quizzes.length}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-medium text-gray-700">Respuestas Correctas</span>
              <span className="text-lg text-gray-600">{correctAnswers}</span>
            </div>
          </div>
  
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimesCircle className="text-red-500 text-3xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-medium text-gray-700">Respuestas Incorrectas</span>
              <span className="text-lg text-gray-600">{incorrectAnswers}</span>
            </div>
          </div>
          <button
            onClick={handleRetakeQuiz}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
          >
            Volver a Intentar
          </button>

        </div>
      </div>
    );
  };  

  // Actualiza la barra de progreso
  const updateProgress = (index, total) => {
    if (total > 0) {
      setProgress(((index + 1) / total) * 100);
    }
  };

  // Navega al recurso anterior
  const handlePrevious = () => {
    if (currentResourceIndex > 0) {
      const previousResource = resources[currentResourceIndex - 1];
      handleResourceClick(previousResource._id, previousResource.courseId);
    }
  };

  // Navega al siguiente recurso
  const handleNext = () => {
    if (currentResourceIndex < resources.length - 1) {
      const nextResource = resources[currentResourceIndex + 1];
      handleResourceClick(nextResource._id, nextResource.courseId);
    }
  };

  const handleResourceClick = (resourceId, courseId) => {
    console.log("Course ID: ", courseId);
    console.log("Resource ID: ", resourceId);
    window.location.href = `/course/${courseId}/resource/${resourceId}`;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  //GenerarPDF
  const handleFinishCourse = () => {
    generatePremiumCertificatePDF(
      username,
      course.title,
      zorro,
      derechaabajo,
      izquierdaarriba
    );
    navigate(`/course/${courseId}`);
  };

  const generatePremiumCertificatePDF = (
    username,
    courseTitle,
    zorroImage,
    derechaabajo,
    izquierdaarriba
  ) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: [28, 21.6], // Tamaño A4 en centímetros
    });

    // Fondo blanco
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 28, 21.6, "F");

    // Añadir imágenes de bordes
    if (izquierdaarriba) {
      doc.addImage(izquierdaarriba, "JPEG", -1, -1, 10, 10);
    }
    if (derechaabajo) {
      doc.addImage(derechaabajo, "JPEG", 19, 13, 10, 10);
    }

    // Agregar fuente personalizada
    doc.addFileToVFS("Anothershabby.ttf", Anothershabby_trial);
    doc.addFont("Anothershabby.ttf", "AnotherShabby", "normal");
    doc.setFont("AnotherShabby"); // Aplicar fuente personalizada

    // Título del certificado
    doc.setFont("AnotherShabby", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(70);
    doc.text("CONSTANCIA", 14, 4.5, { align: "center" });

    // Subtítulo
    doc.setFontSize(25);
    doc.setFont("AnotherShabby", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("De aprendizaje", 18, 5.5, { align: "center" });

    // Imagen de Zorro
    if (zorroImage) {
      doc.addImage(zorroImage, "JPEG", 12, 7, 4, 4);
    }

    // Texto de reconocimiento
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("ESTE CERTIFICADO SE OTORGA A", 14, 13.0, { align: "center" });

    // Nombre del usuario
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(65);
    doc.setFont("AnotherShabby", "normal");
    doc.text(`${username}`, 14, 15.5, { align: "center" });

    // Línea debajo del nombre de usuario
    doc.setLineWidth(0.1); // Grosor de la línea
    doc.setDrawColor(0, 0, 0); // Color negro
    doc.line(6, 16, 22, 16); // Coordenadas de inicio y fin de la línea

    // Título del curso y Texto adicional
    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(
      `Por completar exitosamente el curso "${courseTitle}". `,
      11,
      17.5,
      { align: "center" }
    );

    // Texto adicional
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Gracias por tu dedicación y", 19, 17.5, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("esfuerzo. ¡Sigue aprendiendo y mejorando!", 14, 18.0, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setTextColor(192, 192, 192);
    doc.text("Este certificado fue generado automáticamente.", 14, 19.5, {
      align: "center",
    });

    // Guardar el PDF
    doc.save(`Certificado_${courseTitle}.pdf`);
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!resource) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-t from-blue-200 via-blue-300 to-blue-400">
      <NavigationBar />
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left */}
        <div className="relative hidden lg:block">
          {/* Navegador lateral */}
          <div
            className={`${
              isOpen ? "w-full lg:w-64" : "w-16" // Cambia el ancho cuando está cerrado
            } h-screen bg-gray-300 p-4 lg:p-6 flex lg:flex-col items-center rounded-2xl overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out`}
          >
            {isOpen ? (
              <div className="flex flex-col space-y-6 w-full mt-12">
                {resources.map((resource, index) => (
                  <div
                    key={resource._id}
                    className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      handleResourceClick(resource._id, resource.courseId)
                    }
                  >
                    {/* Círculo con número */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold">
                      {index + 1}
                    </div>

                    {/* Título del recurso */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {resource.title}
                      </h3>
                      {/* Opcional: Agregar más detalles o descripción */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center w-full mt-12">
                {resources.map((resource, index) => (
                  <div
                    key={resource._id}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold mb-4 cursor-pointer"
                    onClick={() =>
                      handleResourceClick(resource._id, resource.courseId)
                    }
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Botón para mostrar/ocultar el menú */}
        <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 lg:left-3 z-50 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Middle */}
        <div className="w-full lg:w-7/12 p-4 lg:p-6 flex flex-col space-y-4">
      {/* Controles de navegación y barra de progreso */}
      <div className="bg-gray-200 p-4 rounded-t-xl shadow-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={currentResourceIndex === 0}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            {t('navigation.previous')}
          </button>

          <div className="flex-1 mx-4">
            <div className="w-full bg-gray-300 rounded-full h-3 mb-4 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-400"
                style={{ width: `${progress}%` }}
              ></div>
              <span className="absolute inset-0 flex justify-center items-center text-xs font-medium text-black">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentResourceIndex === resources.length - 1}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            {t('navigation.next')}
          </button>

          {currentResourceIndex === resources.length - 1 && (
            <button
              onClick={handleFinishCourse}
              className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {t('navigation.finish')}
            </button>
          )}
        </div>
      </div>

      <div className="w-full lg:w-12/12 h-[480px] bg-gray-100 p-6 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
        {isQuizCompleted
          ? renderQuizSummary()
          : resource?.quizzes && resource.quizzes.length > 0
          ? renderQuiz()
          : renderContent(resource?.files)}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col space-y-6">
        <div className="flex items-start space-x-4">
          <div className="bg-gray-300 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
            {/* Aquí podrías agregar un ícono o imagen si es necesario */}
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
              {resource.title || t('resource_view.title')}
            </h2>
            <p className="text-gray-600 text-base">
              {t('resource_view.publishedOn')}{" "}
              {new Intl.DateTimeFormat("es-ES", {
        /*          year: "numeric",
                  month: "long",
                  day: "numeric", */
              }).format(new Date(resource.createdAt))}
            </p> 
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-gray-700 text-base">
            {resource.description || t('resource_view.description')}
          </p>
        </div>
      </div>
    </div>

    {/* Right */}
    <div className="w-full lg:w-4/12 p-4 lg:p-6 flex flex-col space-y-4">
      <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-lg flex flex-col items-center">
        <div className="flex items-center justify-center w-20 h-20 bg-indigo-600 text-white rounded-full border-4 border-indigo-700 mb-4">
          <span className="text-3xl">📅</span>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            <a
              href="#"
              className="hover:text-indigo-700 transition-colors duration-300"
            >
              {t('announcement.comingSoon')}
            </a>
          </h3>
          <p className="text-base text-gray-700">
            {t('announcement.stayTuned')}
          </p>
        </div>
      </article>
          {/* Segundo contenedor */}
          <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-gray-200 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-20 h-20 bg-indigo-600 text-white rounded-full border-4 border-indigo-700 mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <div className="text-xl font-semibold text-gray-800 mb-2">
            {t('announcement.comingSoonNotes')}
          </div>
          <p className="text-base text-gray-700 text-center">
            {t('announcement.stayTuned')}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceView;