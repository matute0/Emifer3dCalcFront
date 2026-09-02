import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

  const fetchFilaments = async () => {
    try {
      const response = await fetch(`${API_URL}/filament/get`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFilaments(data);
      }
    } catch (err) {
      console.error("Error al cargar filamentos:", err);
    }
  };

  useEffect(() => {
    fetchFilaments();
  }, [API_URL]);

  const getFilamentId = (filament) => String(filament.id || filament._id || "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setError(null);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      colour: String(formData.colour),
      type: String(formData.type),
      manufacturer: String(formData.manufacturer),
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

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Error al eliminar el filamento.");
      }

      setSuccessMsg("Filamento eliminado con éxito.");
      if (editingId === id) handleResetForm();
      fetchFilaments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            Gestión de Filamentos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Agrega o modifica los materiales de tu catálogo
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
              <label className="text-sm text-gray-400 block mb-1">Tipo de Material</label>
              <input
                type="text"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Ej: PLA, PETG, ABS, TPU"
                className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Color</label>
              <input
                type="text"
                name="colour"
                required
                value={formData.colour}
                onChange={handleInputChange}
                placeholder="Ej: Negro, Rojo, Azul Translucido"
                className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Fabricante / Marca</label>
              <input
                type="text"
                name="manufacturer"
                required
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="Ej: Esun, GST3D, Bambu Lab"
                className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Precio ($)</label>
              <input
                type="number"
                name="price"
                min="0"
                required
                step="any"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-2.5 rounded-md text-sm mt-4 disabled:opacity-50 transition-colors ${
                editingId
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isLoading
                ? "Guardando..."
                : editingId
                ? "Actualizar Filamento"
                : "Registrar Filamento"}
            </button>
          </form>
        </div>

        {/* Tabla de Filamentos */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg w-full lg:w-2/3 overflow-x-auto">
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
                {filaments.map((filament) => {
                  const id = getFilamentId(filament);
                  const isBeingEdited = editingId === id;

                  return (
                    <tr
                      key={id}
                      className={`transition-colors ${
                        isBeingEdited
                          ? "bg-emerald-950/60 border-l-4 border-l-emerald-500"
                          : "hover:bg-gray-750/50"
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-white">
                        {filament.type}
                        {isBeingEdited && (
                          <span className="ml-2 text-xs text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700 font-normal">
                            Editando
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">{filament.colour}</td>
                      <td className="py-3 px-3">{filament.manufacturer}</td>
                      <td className="py-3 px-3">${filament.price}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(filament)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              isBeingEdited
                                ? "bg-emerald-500 text-white font-semibold"
                                : "bg-emerald-600/80 hover:bg-emerald-500 text-white"
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