import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Costs() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [config, setConfig] = useState({
    profitPercentage: "",
    khwCost: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { text: '', type: 'success' | 'error' }

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/cost/config/get`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al obtener la configuración");

      const data = await response.json();
      setConfig({
        profitPercentage: data.profitPercentage ?? "",
        khwCost: data.khwCost ?? "",
      });
    } catch (err) {
      setMessage({
        text: "No se pudo cargar la configuración actual.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      profitPercentage: Number(config.profitPercentage),
      khwCost: Number(config.khwCost),
    };

    try {
      const response = await fetch(`${API_URL}/cost/config/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al actualizar la configuración");

      setMessage({
        text: "¡Configuración actualizada con éxito!",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: "Error al guardar los cambios. Intentá de nuevo.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-400 text-sm"
        >
          Cargando configuración...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            Parámetros de Costos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Ajusta las variables globales de cálculo para tus impresiones
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

      {/* Tarjeta de Formulario */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-xl bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
          Configuración General
        </h2>

        {/* Feedback visual de Alertas */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className={`p-3 rounded-md text-sm mb-4 border overflow-hidden ${
                message.type === "success"
                  ? "bg-green-900/40 border-green-500/50 text-green-200"
                  : "bg-red-900/40 border-red-500/50 text-red-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Costo de kWh */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Costo por kWh ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="khwCost"
              value={config.khwCost}
              onChange={handleChange}
              placeholder="Ej: 150.50"
              required
              className="w-full bg-gray-700 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm border border-transparent"
            />
          </div>

          {/* Porcentaje de Ganancia */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Porcentaje de Ganancia (%)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              name="profitPercentage"
              value={config.profitPercentage}
              onChange={handleChange}
              placeholder="Ej: 30"
              required
              className="w-full bg-gray-700 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm border border-transparent"
            />
          </div>

          {/* Botón Guardar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-md text-sm mt-4 transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}