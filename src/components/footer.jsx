import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { MailIcon, ChevronUpIcon, BookOpenIcon, GlobeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/img/hola.png";

const Footer = () => {
  const { i18n } = useTranslation("global");
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => setIsExpanded(!isExpanded);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <footer className="bg-gradient-to-r from-[#783CDA] to-[#200E3E] text-white w-full fixed bottom-0 shadow-lg">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : "50px" }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden flex flex-col"
      >
        <div className="container mx-auto px-4 flex flex-col h-full">
          <div className="flex justify-between items-center h-[50px]">
            <motion.button
              onClick={toggleFooter}
              className="text-white focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUpIcon
                className={`w-6 h-6 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </motion.button>
            {!isExpanded && (
              <>
                <span className="text-xs">
                  © 2024 Mesadoko - BrightMind. Todos los derechos reservados.
                </span>
                <img src={Logo} alt="Logo" className="h-10" />
              </>
            )}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-between py-4 h-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-2">
                  <div className="flex flex-col items-start">
                    <h3 className="text-xl font-bold font-bungee mb-2">
                      Aprende con Bright<span className="text-[#00D8A1]">Mind</span>
                    </h3>
                    <p className="text-sm max-w-md font-sans mb-4">
                      Descubre un mundo lleno de oportunidades y aprende a tu
                      propio ritmo. Con nuestros cursos flexibles, podrás
                      mejorar tus habilidades de manera práctica y efectiva,
                      adaptando el aprendizaje a tus necesidades y tiempo
                      disponible.
                    </p>
                    <div className="flex space-x-4">
                      {["facebook", "twitter", "instagram"].map((social) => (
                        <motion.a
                          key={social}
                          href={`https://www.${social}.com/disruptive.devops`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-[#783CDA] hover:bg-[#000000] hover:text-white transition-colors duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {social === "facebook" && <FaFacebook size="16px" />}
                          {social === "twitter" && <FaTwitter size="16px" />}
                          {social === "instagram" && <FaInstagram size="16px" />}
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <img src={Logo} alt="Logo" className="h-32 mb-4" />
                    <div className="flex justify-center space-x-4 mb-2">
                      <button
                       /*  onClick={() => changeLanguage("en")} */
                        className="text-sm hover:text-[#00D8A1] transition-colors duration-300 font-bungee"
                      >
                        Desarrollado en Disruptive
                      </button>
                     {/*  <button
                        onClick={() => changeLanguage("es")}
                        className="text-sm hover:text-[#00D8A1] transition-colors duration-300 font-bungee"
                      >
                        Disruptive
                      </button> */}
                    </div>
                    <span className="text-xs">
                      © 2024 Mesadoko - BrightMind. Todos los derechos reservados.
                    </span>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between">
                    <div className="w-full">
                      <h4 className="text-lg font-bold mb-3 text-[#00D8A1]">
                        Explora nuestro mundo
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.a
                          href="#"
                          className="flex items-center space-x-2 text-sm hover:text-[#00D8A1] transition-colors duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <BookOpenIcon size={16} />
                          <span>Cursos disponibles</span>
                        </motion.a>
                        <motion.a
                          href="#"
                          className="flex items-center space-x-2 text-sm hover:text-[#00D8A1] transition-colors duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <GlobeIcon size={16} />
                          <span>Blog informativo</span>
                        </motion.a>
                        <motion.a
                          href="#"
                          className="flex items-center space-x-2 text-sm hover:text-[#00D8A1] transition-colors duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <BookOpenIcon size={16} />
                          <span>Tus cursos</span>
                        </motion.a>
                        <motion.a
                          href="#"
                          className="flex items-center space-x-2 text-sm hover:text-[#00D8A1] transition-colors duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <GlobeIcon size={16} />
                          <span>No se que mas poner jaja</span>
                        </motion.a>
                      </div>
                    </div>
                    <motion.button
                      className="mt-4 flex items-center space-x-2 px-6 py-3 text-sm font-bold text-[#783CDA] bg-white rounded-full shadow-lg hover:bg-[#00D8A1] hover:text-white transition-all duration-300 ease-in-out"
                      onClick={() => (window.location.href = "mailto:contacto@empresa.com")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MailIcon className="w-5 h-5" />
                      <span>Contáctanos</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
