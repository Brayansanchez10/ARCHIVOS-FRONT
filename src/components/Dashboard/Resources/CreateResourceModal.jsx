import React, { useState, useEffect } from "react";
import { Modal, Button, notification, Card, Collapse } from "antd";
import { toast } from "react-toastify";
import {
  createResource,
  getResource,
  deleteResource,
} from "../../../api/courses/resource.request";
import UpdateResourceForm from "./UpdateResourceForm"; // Corregir importación (nombre en mayúsculas)
import { EditOutlined, DeleteFilled, FilePdfOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import Swal from "sweetalert2"; //Importamos SweetAlert
import { useTranslation } from "react-i18next";


const { Text } = Typography;

const { Panel } = Collapse;

const ALLOWED_FILE_TYPES = [".mov", ".docx", ".pdf", ".jpg", ".png"];
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:watch\?v=|embed\/|playlist\?list=)|youtu\.be\/)[a-zA-Z0-9_-]{11}(?:\S*)?$/i;
const VIMEO_URL_REGEX = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)$/i;
const GOOGLE_DRIVE_URL_REGEX = /^(https?:\/\/)?(drive\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)(\/[^?]*)(\?.*)?$/i;

const CreateResourceModal = ({
  isVisible,
  onCancel,
  courseId,
  onCreate,
  visible,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [resources, setResources] = useState([]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [type, setType] = useState("file");
  const [selection, setSelection] = useState("file"); // Estado para seleccionar entre archivo y enlace
  const [quizzes, setQuizzes] = useState([]); // Estado para quizzes
  const [errors, setErrors] = useState({});
  const { t } = useTranslation("global");

  const validateFields = () => {
    const newErrors = {};

    // Validación del título (mínimo 3 caracteres)
    if (!title || title.length < 3) {
      newErrors.title = t("UpdateResource.ValidateTitle");
    }

    // Validación de la descripción (mínimo 8 caracteres)
    if (!description || description.length < 8) {
      newErrors.description = t("UpdateResource.ValidateDescription");
    }

    setErrors(newErrors);

    // Si no hay errores, retorna true, de lo contrario false
    return Object.keys(newErrors).length === 0;
  };

  const validateQuizzes = () => {
    // Función para validar QUIZ
    const newErrors = {};

    quizzes.forEach((quiz, index) => {
      const quizErrors = {};

      // Validación de la pregunta
      if (!quiz.question || quiz.question.length < 3) {
        quizErrors.question = t("UpdateResource.ValidateQuestion");
      }

      // Validación de las opciones
      if (quiz.options.length < 2) {
        quizErrors.options = t("UpdateResource.ValidateOptions");
      } else {
        quiz.options.forEach((option, optIndex) => {
          if (!option || option.trim() === "") {
            if (!quizErrors.options) {
              quizErrors.options = {};
            }
            quizErrors.options[optIndex] = t("UpdateResource.Option");
          }
        });
      }

      // Validación de la respuesta correcta
      if (!quiz.correctAnswer || !quiz.options.includes(quiz.correctAnswer)) {
        quizErrors.correctAnswer = t("UpdateResource.ValidationAnswer");
      }

      if (Object.keys(quizErrors).length > 0) {
        newErrors[index] = quizErrors;
      }
    });

    setErrors(newErrors);

    // Si no hay errores, retorna true, de lo contrario false
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isVisible && courseId) {
      fetchResources(courseId);
    } else {
      setResources([]); // Limpiar los recursos al cerrar la modal
    }
  }, [isVisible, courseId]);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible]);

  const resetState = () => {
    setTitle("");
    setDescription("");
    setLink("");
    setSelectedFile(null);
    setType("file");
    setSelection("file");
    setEditModalVisible(false);
    setSelectedResource(null);
    setQuizzes([]); // Resetear quizzes al cerrar el modal
  };

  const isVideoLink = (file) => {
    return (
      YOUTUBE_URL_REGEX.test(file) ||
      VIMEO_URL_REGEX.test(file) ||
      GOOGLE_DRIVE_URL_REGEX.test(file)
    );
  };

  const isValidLink = (url) => {
    return (
      YOUTUBE_URL_REGEX.test(url) ||
      VIMEO_URL_REGEX.test(url) ||
      GOOGLE_DRIVE_URL_REGEX.test(url)
    );
  };

  const getEmbedUrl = (file) => {
    if (YOUTUBE_URL_REGEX.test(file)) {
      const videoId = file.includes("youtu.be/")
        ? file.split("youtu.be/")[1].split("?")[0]
        : new URL(file).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (VIMEO_URL_REGEX.test(file)) {
      const videoId = file.match(VIMEO_URL_REGEX)[4];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    if (GOOGLE_DRIVE_URL_REGEX.test(file)) {
      const fileId = file.match(GOOGLE_DRIVE_URL_REGEX)[3];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return "";
  };

  // Manejar cambios en los quizzes
  const handleQuizChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuizzes = [...quizzes];
    if (name.startsWith("options")) {
      const optionIndex = parseInt(name.split("[")[1].split("]")[0], 10);
      updatedQuizzes[index].options[optionIndex] = value;
    } else {
      updatedQuizzes[index][name] = value;
    }
    setQuizzes(updatedQuizzes);
  };

  // Añadir una nueva opción
  const addOption = (quizIndex) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[quizIndex].options.push(""); // Añadir una opción vacía
    setQuizzes(updatedQuizzes);
  };

  // Eliminar una opción
  const removeOption = (quizIndex, optionIndex) => {
    const updatedQuizzes = [...quizzes];
    if (updatedQuizzes[quizIndex].options.length > 2) {
      // Asegurar que queden al menos 2 opciones
      updatedQuizzes[quizIndex].options.splice(optionIndex, 1);
      setQuizzes(updatedQuizzes);
    }
  };

  // Añadir un nuevo quiz
  const addQuiz = () => {
    setQuizzes((prevState) => [
      ...prevState,
      { question: "", options: ["", ""], correctAnswer: "" },
    ]);
  };

  const removeQuiz = (index) => {
    setQuizzes((prevState) =>
      prevState.filter((_, quizIndex) => quizIndex !== index)
    );
  };

  const fetchResources = async (courseId) => {
    try {
      const response = await getResource(courseId);
      setResources(response.data);
    } catch (err) {
      console.error("Error al obtener los recursos:", err);
      toast.error("Error al obtener los recursos");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Llamar a la validación
    if (!validateFields()) {
      return; // Si hay errores, no envía el formulario
    }

    // Validar los quizzes antes de enviar el formulario
    if (!validateQuizzes()) {
      return; // Si hay errores, no enviar el formulario
    }

    if (selection === "link" && link && !isValidLink(link)) {
      Swal.fire({
        icon: "warning",
        title: t("CreateResource.InvalidLink"),
        text: t("UpdateResource.Validatelink"),
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const resourceData = {
      courseId,
      title,
      description,
      link: selection === "link" ? link : null,
      file: selection === "file" ? selectedFile : null,
      quizzes: quizzes.map((quiz) => ({
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.correctAnswer,
      })),
    };

    try {
      await createResource(resourceData);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: t("CreateResource.Create"),
        showConfirmButton: false,
        timer: 1500,
      });
      onCreate();
      fetchResources(courseId); // Actualizar la lista de recursos tras crear uno nuevo

      // Resetear campos del formulario
      resetState();
    } catch (err) {
      console.error("Error al crear el recurso:", err);
      Swal.fire({
        icon: "error",
        title: t("UpdateResource.ErrorAlert"),
        showConfirmButton: false,
        timer: 1000,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (ALLOWED_FILE_TYPES.includes(`.${fileExtension}`)) {
      setSelectedFile(file);
    } else {
      Swal.fire({
        icon: "warning",
        title: t("UpdateResource.ValidationAlertFile"),
        text: t("UpdateResource.ValidationAlertFileDescription"),
        showConfirmButton: false,
        timer: 2500,
      });
      e.target.value = "";
      setSelectedFile(null);
    }
  };

  const handleLinkChange = (e) => setLink(e.target.value);

  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedResource(null);
  };

  const handleRemoveResource = async (resource) => {
    try {
      await deleteResource(resource._id);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: t("CreateResource.DeleteResource"),
        showConfirmButton: false,
        timer: 700,
      });
      fetchResources(courseId); // Actualiza la lista de recursos
    } catch (error) {
      console.error("Error al eliminar el recurso:", error);
      Swal.fire({
        icon: "error",
        title: t("CreateResource.ErrorDelete"),
        showConfirmButton: false,
        timer: 1000,
      });
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  return (
    <Modal
      title=""
      visible={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      bodyStyle={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "75vh",
      }} // Para centrar el modal y darle altura
    >
      {/* Contenedor principal centrado */}
      <div className="flex justify-center items-center h-full">
        {/* Contenedor de los paneles con separación y scroll */}
        <div className="flex gap-8 h-full">
          {/* Panel de recursos a la izquierda con scroll */}
          <div
            className="w-96 p-4 border border-gray-300 rounded-lg shadow-lg overflow-y-auto"
            style={{ maxHeight: "700px", width: "600px" }}
          >
            <h3 className="text-lg font-bold mb-4">{t("CreateResource.TitleResources")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              {resources.length > 0 ? (
                <Collapse accordion>
                  {resources.map((resource) => (
                    <Panel
                      header={
                        <div className="flex justify-between items-center">
                          {resource.title}
                          <div className="flex ml-auto space-x-2">
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => openEditModal(resource)}
                            >
                              {t("CreateResource.Edit")}
                            </Button>
                            <Button
                              icon={<DeleteFilled />}
                              onClick={() => {
                                Swal.fire({
                                  title: t("CreateResource.AlertDeleteTitle"),
                                  text: t("CreateResource.AlertDeleteText"),
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#28a745",
                                  cancelButtonColor: "#d35",
                                  confirmButtonText: t("CreateResource.AlertDeleteConfir"),
                                  reverseButtons: true,
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    // Aquí llamas a la función que elimina el recurso
                                    handleRemoveResource(resource);

                                    // Mostrar mensaje de éxito
                                    Swal.fire({
                                      title: t("CreateResource.AlerteSuccesyDelete"),
                                      text: t("CreateResource.DeleteResource"),
                                      icon: "success",
                                    });
                                  }
                                });
                              }}
                            >
                              {t("CreateResource.Delete")}
                            </Button>
                          </div>
                        </div>
                      }
                      key={resource._id}
                    >
                      <Card>
                        {/* Flex container for video and description */}
                        <div className="flex justify-between items-center">
                          {/* Condición para mostrar quiz si no hay archivos, videos o imágenes */}
                          {resource.files &&
                          (isVideoLink(resource.files) ||
                            resource.files.endsWith(".pdf") ||
                            /\.(jpg|jpeg|png)$/i.test(resource.files)) ? (
                            <>
                              {/* Video o PDF a la izquierda */}
                              <div className="w-1/2">
                                {isVideoLink(resource.files) ? (
                                  <iframe
                                    src={getEmbedUrl(resource.files)}
                                    frameBorder="0"
                                    style={{ width: "250px", height: "250px" }} // Ajusta el ancho y la altura aquí
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : resource.files.endsWith(".pdf") ? (
                                  <div className="text-center">
                                    <div className="flex items-center justify-center mb-4">
                                      <FilePdfOutlined className="text-red-600 text-6xl" />
                                    </div>
                                    <a
                                      href={resource.files}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline text-lg"
                                      download
                                    >
                                      {t("CreateResource.DowloadPDF")}
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <img
                                      src={resource.files}
                                      alt={`Content ${resource.title}`}
                                      className="max-w-full h-auto"
                                    />
                                  </div>
                                )}
                              </div>
                              {/* Descripción a la derecha */}
                              <div className="w-1/2 pl-10">
                                <p>{resource.description}</p>
                                {resource.file && (
                                  <p>{t("UpdateResource.Files")}: {resource.file.name}</p>
                                )}
                              </div>
                            </>
                          ) : resource.quizzes &&
                            resource.quizzes.length > 0 ? (
                            <div className="w-full">
                              <h4 className="text-md font-bold mb-4">
                                {t("CreateResource.QuizzTitleModal")}
                              </h4>
                              {resource.quizzes.map((quiz, index) => (
                                <div
                                  key={index}
                                  className="mb-6 p-4 border border-gray-300 rounded-md shadow-sm"
                                >
                                  <div className="mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      {t("UpdateResource.Question")}:
                                    </label>
                                    <p className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100">
                                      {quiz.question}
                                    </p>
                                  </div>
                                  <div className="mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      {t("UpdateResource.labelOption")}:
                                    </label>
                                    {quiz.options.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className="flex items-center mb-1"
                                      >
                                        <span className="mr-2 text-gray-600">
                                          {String.fromCharCode(65 + optIndex)})
                                        </span>
                                        <p className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100">
                                          {option}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700">
                                      {t("UpdateResource.CorrectAnswer")}:
                                    </label>
                                    <p className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100">
                                      {quiz.correctAnswer}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>{t("UpdateResource.labelOption")}: {resource.description}</p>
                          )}
                        </div>
                      </Card>
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <p>{t("CreateResource.NoResources")}</p>
              )}
            </div>
          </div>

          {/* Formulario de creación a la derecha con scroll */}
          <div
            className="w-full max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg overflow-y-auto bg-white"
            style={{ maxHeight: "700px" }}
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {t("CreateResource.FormCreate")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("UpdateResource.Title")}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("UpdateResource.Description")}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("CreateResource.TipeResource")}
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="file">{t("UpdateResource.Files")}</option>
                  <option value="quiz">{t("CreateResource.QuizzTitleModal")}</option>
                </select>
              </div>

              {type === "file" && (
                <>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setSelection("file")}
                      className={`mr-4 px-4 py-2 rounded-lg focus:outline-none ${
                        selection === "file"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                    >
                      {t("CreateResource.UpFile")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelection("link")}
                      className={`px-4 py-2 rounded-lg focus:outline-none ${
                        selection === "link"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                    >
                      {t("UpdateResource.LinkVideo")}
                    </button>
                  </div>

                  {selection === "file" && (
                    <div className="mb-4">
                      <label
                        htmlFor="file"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("UpdateResource.Files")}
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm file:bg-blue-100 file:border-none file:py-2 file:px-4 file:text-blue-700"
                      />
                    </div>
                  )}

                  {selection === "link" && (
                    <div className="mb-4">
                      <label
                        htmlFor="link"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("CreateResource.VideoLink")}
                      </label>
                      <input
                        type="text"
                        id="link"
                        value={link}
                        onChange={handleLinkChange}
                        placeholder={t("UpdateResource.AddLink")}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    </div>
                  )}

                  <div></div>
                </>
              )}

              {type === "quiz" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("CreateResource.QuizzTitleModal")}
                  </label>
                  {quizzes.map((quiz, index) => (
                    <div
                      key={index}
                      className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm"
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("UpdateResource.Question")}
                        </label>
                        <input
                          type="text"
                          name="question"
                          value={quiz.question}
                          onChange={(e) => handleQuizChange(index, e)}
                          placeholder={t("UpdateResource.Question")}
                          className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
                            errors[index]?.question
                              ? "border-red-500"
                              : "border-gray-300"
                          } shadow-sm`}
                        />
                        {errors[index]?.question && (
                          <p className="text-red-500 text-sm">
                            {errors[index].question}
                          </p>
                        )}
                      </div>
                      {quiz.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center mb-2">
                          <span className="mr-2 text-gray-600">
                            {String.fromCharCode(65 + optIndex)})
                          </span>
                          <input
                            type="text"
                            name={`options[${optIndex}]`}
                            value={option}
                            onChange={(e) => handleQuizChange(index, e)}
                            placeholder={t("UpdateResource.OptionIndex", { optIndex: optIndex + 1 })}    
                            className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
                              errors[index]?.options?.[optIndex]
                                ? "border-red-500"
                                : "border-gray-300"
                            } shadow-sm`}
                          />
                          {errors[index]?.options?.[optIndex] && (
                            <p className="text-red-500 text-sm">
                              {errors[index].options[optIndex]}
                            </p>
                          )}
                          {quiz.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index, optIndex)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              {t("UpdateResource.DeleteOption")}
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(index)}
                        className="mt-2 text-blue-500 hover:text-blue-700"
                      >
                        {t("UpdateResource.AddOption")}
                      </button>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("UpdateResource.CorrectAnswer")}
                      </label>
                      <select
                        name="correctAnswer"
                        value={quiz.correctAnswer || ""}
                        onChange={(e) => handleQuizChange(index, e)}
                        className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
                          errors[index]?.correctAnswer
                            ? "border-red-500"
                            : "border-gray-300"
                        } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                      >
                        <option value="">{t("UpdateResource.SelectOption")}</option>
                        {quiz.options.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {`${String.fromCharCode(65 + optIndex)}) ${option}`}
                          </option>
                        ))}
                      </select>
                      {errors[index]?.correctAnswer && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[index].correctAnswer}
                        </p>
                      )}
                      {/* Mostrar botón "Eliminar pregunta" solo si hay más de una pregunta */}
                      {quizzes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuiz(index)}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          {t("CreateResource.DeleteQuestion")}
                        </button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addQuiz}
                    className="w-full mt-4"
                  >
                    {t("CreateResource.AddQuestion")}
                  </Button>
                </div>
              )}

              <div className="flex justify-between gap-4 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {t("CreateResource.ButtonCreate")}
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-black"
                >
                  {t("UpdateResource.ButtonCancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isEditModalVisible && (
        <UpdateResourceForm
          isVisible={isEditModalVisible}
          onCancel={closeEditModal}
          resourceData={selectedResource}
          onUpdate={() => fetchResources(courseId)} // Actualiza la lista de recursos después de la edición
        />
      )}
    </Modal>
  );
};

export default CreateResourceModal;