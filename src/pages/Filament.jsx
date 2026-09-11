import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Reglas de validación idénticas al backend Java
const REGEX_TYPE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s+-]+$/;
const REGEX_COLOUR = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const REGEX_MANUFACTURER = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.\-&]+$/;

export default function FilamentsManager() {
  const API_URL = import.meta.env.VITE_API_URL;

  const initialFormState = {
    colour: "",
    type: "",
    manufacturer: "",
    price: 0,
  };

  const [filaments, setFilaments] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Estados para validación en tiempo real
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const safeJsonParse = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_) {
      return { message: text };
    }
  };

  const fetchFilaments = async () => {
    try {
      const response = await fetch(`${API_URL}/filament/get`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await safeJsonParse(response);
        setFilaments(data || []);
      }
    } catch (err) {
      console.error("Error al cargar filamentos:", err);
    }
  };

  useEffect(() => {
    fetchFilaments();
  }, [API_URL]);

  const getFilamentId = (filament) => String(filament.id || filament._id || "");

  // Función de validación en tiempo real
  const validate = (data, currentEditingId, list) => {
    const errors = {};

    // Validar Tipo
    if (!data.type || !data.type.trim()) {
      errors.type = "El tipo de material es obligatorio.";
    } else if (!REGEX_TYPE.test(data.type)) {
      errors.type = "Solo letras, números, espacios y caracteres '+' o '-'.";
    }

    // Validar Color
    if (!data.colour || !data.colour.trim()) {
      errors.colour = "El color es obligatorio.";
    } else if (!REGEX_COLOUR.test(data.colour)) {
      errors.colour = "El color solo puede contener letras y espacios.";
    }

    // Validar Fabricante
    if (!data.manufacturer || !data.manufacturer.trim()) {
      errors.manufacturer = "El fabricante es obligatorio.";
    } else if (!REGEX_MANUFACTURER.test(data.manufacturer)) {
      errors.manufacturer = "Solo letras, números, espacios y caracteres '.', '-', '&'.";
    }

    // Validar Precio
    if (Number(data.price) <= 0 || isNaN(Number(data.price))) {
      errors.price = "El precio debe ser un número mayor a 0.";
    }

    // Validar Duplicados en tiempo real (mismísima regla que Java)
    if (!errors.type && !errors.colour && !errors.manufacturer) {
      const isDuplicate = list.some((item) => {
        const itemId = getFilamentId(item);
        const matches =
          item.type?.trim().toLowerCase() === data.type.trim().toLowerCase() &&
          item.colour?.trim().toLowerCase() === data.colour.trim().toLowerCase() &&
          item.manufacturer?.trim().toLowerCase() === data.manufacturer.trim().toLowerCase();

        return currentEditingId ? matches && itemId !== currentEditingId : matches;
      });

      if (isDuplicate) {
        errors.duplicate = "Ya existe un filamento registrado con este Tipo, Color y Fabricante.";
      }
    }

    return errors;
  };

  // Ejecuta validación cada vez que cambia el formulario, la lista o el modo de edición
  useEffect(() => {
    const errors = validate(formData, editingId, filaments);
    setFieldErrors(errors);
  }, [formData, editingId, filaments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setError(null);
    setTouched({});
  };

  const handleEditClick = (filament) => {
    setError(null);
    setSuccessMsg(null);

    const id = getFilamentId(filament);
    setFormData({
      colour: filament.colour || "",
      type: filament.type || "",
      manufacturer: filament.manufacturer || "",
      price: filament.price || 0,
    });
    setEditingId(id);
    setTouched({ colour: true, type: true, manufacturer: true, price: true });
  };

  const isFormInvalid = Object.keys(fieldErrors).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos los campos como interactuados al enviar
    setTouched({ colour: true, type: true, manufacturer: true, price: true });

    if (isFormInvalid) {
      setError(fieldErrors.duplicate || "Por favor corrige los errores del formulario.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      colour: String(formData.colour).trim(),
      type: String(formData.type).trim(),
      manufacturer: String(formData.manufacturer).trim(),
      price: Number(formData.price),
    };

    const endpoint = editingId
      ? `${API_URL}/filament/update/${editingId}`
      : `${API_URL}/filament/register`;

    const method = editingId ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data?.message || `Error en la solicitud (${response.status})`);
      }

      setSuccessMsg(
        editingId
          ? "Filamento actualizado correctamente."
          : "Filamento registrado exitosamente."
      );
      handleResetForm();
      fetchFilaments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este filamento?")) {
      return;
    }

    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_URL}/filament/delete?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data?.message || "Error al eliminar el filamento.");
      }

      setSuccessMsg("Filamento eliminado con éxito.");
      if (editingId === id) handleResetForm();
      fetchFilaments();
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper para clases CSS según estado del campo
  const getInputStyle = (fieldName) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    const isValid = touched[fieldName] && !fieldErrors[fieldName];

    if (hasError) return "border-red-500 focus:ring-red-500 focus:border-red-500";
    if (isValid) return "border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500";
    return "border-gray-700 focus:ring-emerald-500 focus:border-emerald-500";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            Gestión de Filamentos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Agrega o modifica los materiales de tu catálogo
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/admin"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 px-4 rounded-md border border-gray-700 transition-colors inline-block"
          >
            ← Volver al Menú Admin
          </Link>
        </motion.div>
      </motion.div>

      {/* Mensajes globales */}
      <div className="w-full max-w-6xl mb-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error-msg"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-red-900/40 border border-red-500/50 text-red-200 p-3 rounded-md text-sm mb-2 overflow-hidden"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              key="success-msg"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-green-900/40 border border-green-500/50 text-green-200 p-3 rounded-md text-sm mb-2 overflow-hidden"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Formulario */}
        <motion.div
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-6 rounded-xl shadow-lg w-full lg:w-1/3 transition-all duration-300 ${
            editingId
              ? "bg-gray-800 border-2 border-emerald-500 ring-4 ring-emerald-500/20 shadow-emerald-500/10"
              : "bg-gray-800 border border-gray-700"
          }`}
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Editar Filamento" : "Nuevo Filamento"}
              </h2>
              {editingId && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            {editingId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetForm}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Cancelar edición
              </motion.button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Advertencia de Duplicado */}
            <AnimatePresence>
              {fieldErrors.duplicate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-900/30 border border-amber-500/50 text-amber-200 text-xs p-2.5 rounded-md mb-2"
                >
                  ⚠️ {fieldErrors.duplicate}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Campo: Tipo */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Tipo de Material</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                onBlur={() => setTouched((p) => ({ ...p, type: true }))}
                placeholder="Ej: PLA, PETG, ABS, TPU"
                className={`w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputStyle(
                  "type"
                )}`}
              />
              <AnimatePresence>
                {touched.type && fieldErrors.type && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.type}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Campo: Color */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Color</label>
              <input
                type="text"
                name="colour"
                value={formData.colour}
                onChange={handleInputChange}
                onBlur={() => setTouched((p) => ({ ...p, colour: true }))}
                placeholder="Ej: Negro, Rojo, Azul Translucido"
                className={`w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputStyle(
                  "colour"
                )}`}
              />
              <AnimatePresence>
                {touched.colour && fieldErrors.colour && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.colour}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Campo: Fabricante */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Fabricante / Marca</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                onBlur={() => setTouched((p) => ({ ...p, manufacturer: true }))}
                placeholder="Ej: Esun, GST3D, Bambu Lab"
                className={`w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputStyle(
                  "manufacturer"
                )}`}
              />
              <AnimatePresence>
                {touched.manufacturer && fieldErrors.manufacturer && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.manufacturer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Campo: Precio */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Precio ($)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="any"
                value={formData.price}
                onChange={handleInputChange}
                onBlur={() => setTouched((p) => ({ ...p, price: true }))}
                className={`w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputStyle(
                  "price"
                )}`}
              />
              <AnimatePresence>
                {touched.price && fieldErrors.price && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.price}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: isFormInvalid ? 1 : 1.02 }}
              whileTap={{ scale: isFormInvalid ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading || isFormInvalid}
              className={`w-full font-bold py-2.5 rounded-md text-sm mt-4 transition-colors ${
                isFormInvalid
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : editingId
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isLoading
                ? "Guardando..."
                : editingId
                ? "Actualizar Filamento"
                : "Registrar Filamento"}
            </motion.button>
          </form>
        </motion.div>

        {/* Tabla de Filamentos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg w-full lg:w-2/3 overflow-x-auto"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Listado de Filamentos
          </h2>

          {filaments.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">
              No hay filamentos registrados actualmente.
            </p>
          ) : (
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-750 text-gray-400 uppercase text-xs border-b border-gray-700">
                <tr>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Color</th>
                  <th className="py-3 px-3">Marca</th>
                  <th className="py-3 px-3">Precio</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filaments.map((filament) => {
                    const id = getFilamentId(filament);
                    const isBeingEdited = editingId === id;

                    return (
                      <motion.tr
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`transition-colors ${
                          isBeingEdited
                            ? "bg-emerald-950/60 border-l-4 border-l-emerald-500"
                            : "hover:bg-gray-750/50"
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-white">
                          {filament.type}
                          {isBeingEdited && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-2 text-xs text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700 font-normal inline-block"
                            >
                              Editando
                            </motion.span>
                          )}
                        </td>
                        <td className="py-3 px-3">{filament.colour}</td>
                        <td className="py-3 px-3">{filament.manufacturer}</td>
                        <td className="py-3 px-3">${filament.price}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditClick(filament)}
                              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                isBeingEdited
                                  ? "bg-emerald-500 text-white font-semibold"
                                  : "bg-emerald-600/80 hover:bg-emerald-500 text-white"
                              }`}
                            >
                              {isBeingEdited ? "En edición" : "Editar"}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(id)}
                              className="bg-red-600/80 hover:bg-red-500 text-white px-2.5 py-1 rounded text-xs transition-colors"
                            >
                              Eliminar
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}