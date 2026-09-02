import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PrintersManager() {
  const API_URL = import.meta.env.VITE_API_URL;

  const initialFormState = {
    name: "",
    manufacturer: "",
    watts: 0,
    multiColour: false,
    wearCost: 0,
  };

  const [printers, setPrinters] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchPrinters = async () => {
    try {
      const response = await fetch(`${API_URL}/printer/list`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPrinters(data);
      }
    } catch (err) {
      console.error("Error al cargar impresoras:", err);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, [API_URL]);

  const getPrinterId = (printer) => String(printer.id || printer._id || "");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setError(null);
  };

  const handleEditClick = async (id) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`${API_URL}/printer/get/${id}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          manufacturer: data.manufacturer || "",
          watts: data.watts || 0,
          multiColour: Boolean(data.multiColour),
          wearCost: data.wearCost || 0,
        });
        setEditingId(id);
      } else {
        setError("No se pudieron obtener los detalles de la impresora.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al obtener la impresora.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      name: String(formData.name),
      manufacturer: String(formData.manufacturer),
      watts: Number(formData.watts),
      multiColour: Boolean(formData.multiColour),
      wearCost: Number(formData.wearCost),
    };

    const endpoint = editingId
      ? `${API_URL}/printer/update/${editingId}`
      : `${API_URL}/printer/register`;

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        const responseText = await response.text();
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.warn("La respuesta no contiene JSON válido.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message || `Error en la solicitud (${response.status})`
        );
      }

      setSuccessMsg(
        editingId
          ? "Impresora actualizada correctamente."
          : "Impresora registrada exitosamente."
      );
      handleResetForm();
      fetchPrinters();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta impresora?")) {
      return;
    }

    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_URL}/printer/delete?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Error al eliminar la impresora.");
      }

      setSuccessMsg("Impresora eliminada con éxito.");
      if (editingId === id) handleResetForm();
      fetchPrinters();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
            Gestión de Impresoras
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Agrega o modifica equipos de tu catálogo
          </p>
        </div>
        <Link
          to="/admin"
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 px-4 rounded-md border border-gray-700 transition-colors"
        >
          ← Volver al Menú Admin
        </Link>
      </div>

      {/* Mensajes globales */}
      <div className="w-full max-w-6xl mb-4">
        {error && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-3 rounded-md text-sm mb-2">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-900/40 border border-green-500/50 text-green-200 p-3 rounded-md text-sm mb-2">
            {successMsg}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Formulario (Menú Izquierdo) */}
        <div
          className={`p-6 rounded-xl shadow-lg w-full lg:w-1/3 transition-all duration-300 ${
            editingId
              ? "bg-gray-800 border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-blue-500/10"
              : "bg-gray-800 border border-gray-700"
          }`}
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Editar Impresora" : "Nueva Impresora"}
              </h2>
              {editingId && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
            {editingId && (
              <button
                onClick={handleResetForm}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Ender 3 V2, Bambu P1P"
                className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Fabricante</label>
              <input
                type="text"
                name="manufacturer"
                required
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="Ej: Creality, Bambu Lab"
                className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Consumo (Watts)
                </label>
                <input
                  type="number"
                  name="watts"
                  min="0"
                  required
                  step="any"
                  value={formData.watts}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Costo Desgaste
                </label>
                <input
                  type="number"
                  name="wearCost"
                  min="0"
                  required
                  step="any"
                  value={formData.wearCost}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="multiColour"
                name="multiColour"
                checked={formData.multiColour}
                onChange={handleInputChange}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="multiColour" className="text-sm text-gray-300">
                Soporta Multi-Color (AMS / MMU)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-2.5 rounded-md text-sm mt-4 disabled:opacity-50 transition-colors ${
                editingId
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isLoading
                ? "Guardando..."
                : editingId
                ? "Actualizar Impresora"
                : "Registrar Impresora"}
            </button>
          </form>
        </div>

        {/* Tabla de Impresoras */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg w-full lg:w-2/3 overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-4">
            Listado de Impresoras
          </h2>

          {printers.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">
              No hay impresoras registradas actualmente.
            </p>
          ) : (
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-750 text-gray-400 uppercase text-xs border-b border-gray-700">
                <tr>
                  <th className="py-3 px-3">Nombre</th>
                  <th className="py-3 px-3">Marca</th>
                  <th className="py-3 px-3">Watts</th>
                  <th className="py-3 px-3">Multi-color</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {printers.map((printer) => {
                  const id = getPrinterId(printer);
                  const isBeingEdited = editingId === id;

                  return (
                    <tr
                      key={id}
                      className={`transition-colors ${
                        isBeingEdited
                          ? "bg-blue-950/60 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-750/50"
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-white">
                        {printer.name}
                        {isBeingEdited && (
                          <span className="ml-2 text-xs text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700 font-normal">
                            Editando
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">{printer.manufacturer}</td>
                      <td className="py-3 px-3">{printer.watts}W</td>
                      <td className="py-3 px-3">
                        {printer.multiColour ? (
                          <span className="text-green-400 text-xs">Sí</span>
                        ) : (
                          <span className="text-gray-500 text-xs">No</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(id)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              isBeingEdited
                                ? "bg-blue-500 text-white font-semibold"
                                : "bg-blue-600/80 hover:bg-blue-500 text-white"
                            }`}
                          >
                            {isBeingEdited ? "En edición" : "Editar"}
                          </button>

                          <button
                            onClick={() => handleDelete(id)}
                            className="bg-red-600/80 hover:bg-red-500 text-white px-2.5 py-1 rounded text-xs transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}