import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Creamos un componente Link animable con Framer Motion
const MotionLink = motion(Link);

export default function AdminMenu() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Estados para el modal de confirmación
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_URL}/user/logout`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate("/");
    }
  };

  const adminSections = [
    {
      title: "Impresoras",
      description: "Añade, edita o elimina impresoras y ajusta su consumo o estado multi-color.",
      path: "/admin/printers",
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
    },
    {
      title: "Filamentos",
      description: "Gestiona el inventario de materiales, colores, fabricantes y precios por kilo.",
      path: "/admin/filaments",
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Costos y Tarifas",
      description: "Configura el precio del kWh de electricidad, margen de ganancia y desgaste.",
      path: "/admin/costs",
      icon: (
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Variantes para escalonar la entrada de las tarjetas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex justify-between items-center mb-10"
      >
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestiona los recursos base de la calculadora
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLogoutModal(true)}
          className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-red-200 bg-gradient-to-r from-red-950/60 via-red-900/40 to-rose-950/60 border border-red-500/30 hover:border-red-400/80 shadow-lg hover:shadow-red-500/20 hover:text-white transition-all duration-300 ease-out overflow-hidden"
        >
          {/* Destello de luz diagonal */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-red-500/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

          {/* Ícono dinámico */}
          <svg
            className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>

          <span className="relative z-10">Cerrar Sesión</span>
        </motion.button>
      </motion.div>

      {/* Grid de Secciones con entrada en cascada */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {adminSections.map((section, index) => (
          <MotionLink
            key={index}
            to={section.path}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group bg-gray-800 border border-gray-700 hover:border-blue-500/50 p-6 rounded-xl shadow-lg transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-gray-700/50 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {section.title}
              </h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                {section.description}
              </p>
            </div>

            <div className="mt-6 flex items-center text-sm font-semibold text-blue-400 group-hover:text-blue-300">
              Administrar
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </MotionLink>
        ))}
      </motion.div>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo oscuro traslúcido con desenfoque */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Ventana del Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative z-10 w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cerrar Sesión</h3>
                  <p className="text-xs text-gray-400">Confirmación requerida</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                ¿Estás seguro de que deseas salir del panel de administración? Tendrás que iniciar sesión nuevamente para hacer cambios.
              </p>

              {/* Acciones */}
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoggingOut ? "Cerrando..." : "Sí, cerrar sesión"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}