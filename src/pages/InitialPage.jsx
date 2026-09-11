import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "../components/LoginButton";

// Regla para nombres de costos adicionales según el Backend: solo letras y espacios
const REGEX_COST_NAME = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export default function InitialPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [printers, setPrinters] = useState([]);
  const [availableFilaments, setAvailableFilaments] = useState([]);

  const [selectedPrinterId, setSelectedPrinterId] = useState("");
  const [currentPrinter, setCurrentPrinter] = useState(null);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const [selectedFilaments, setSelectedFilaments] = useState([
    { filamentID: "", amount: 0 }
  ]);

  const [additionalCostsList, setAdditionalCostsList] = useState([]);

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de seguimiento de interacción y errores en tiempo real
  const [touched, setTouched] = useState({
    printer: false,
    duration: false,
    filaments: [{}],
    additionalCosts: []
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [printersResponse, filamentsResponse] = await Promise.all([
          fetch(`${API_URL}/printer/list`),
          fetch(`${API_URL}/filament/get`)
        ]);

        if (printersResponse.ok) {
          const printersData = await printersResponse.json();
          setPrinters(printersData || []);
        }

        if (filamentsResponse.ok) {
          const filamentsData = await filamentsResponse.json();
          setAvailableFilaments(filamentsData || []);
        }
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      }
    };

    fetchInitialData();
  }, [API_URL]);

  useEffect(() => {
    const fetchCurrentPrinter = async () => {
      if (!selectedPrinterId) {
        setCurrentPrinter(null);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/printer/get/${selectedPrinterId}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentPrinter(data);
          if (data && data.multiColour !== true) {
            setSelectedFilaments((prev) => [prev[0]]);
            setTouched((prev) => ({
              ...prev,
              filaments: [prev.filaments[0] || {}]
            }));
          }
        }
      } catch (err) {
        console.error("Error al obtener impresora:", err);
      }
    };

    fetchCurrentPrinter();
  }, [selectedPrinterId, API_URL]);

  // Validaciones en tiempo real reflejando CostValidations.java
  const validateForm = () => {
    const errors = {
      printer: "",
      duration: "",
      filaments: [],
      additionalCosts: [],
      duplicateFilaments: false
    };

    // 1. Validar selección de impresora
    if (!selectedPrinterId) {
      errors.printer = "Debes seleccionar una impresora.";
    }

    // 2. Validar duración (hours >= 0, minutes >= 0, y total > 0)
    const h = Number(hours);
    const m = Number(minutes);
    if (isNaN(h) || h < 0 || isNaN(m) || m < 0) {
      errors.duration = "Las horas y minutos deben ser números mayores o iguales a 0.";
    } else if (h === 0 && m === 0) {
      errors.duration = "La duración total de impresión debe ser mayor a 0 minutos.";
    }

    // 3. Validar Filamentos
    const filamentIds = [];
    selectedFilaments.forEach((f, idx) => {
      const filErrors = {};
      if (!f.filamentID) {
        filErrors.filamentID = "Selecciona un material.";
      } else {
        filamentIds.push(String(f.filamentID));
      }

      if (Number(f.amount) <= 0 || isNaN(Number(f.amount))) {
        filErrors.amount = "La cantidad debe ser mayor a 0g.";
      }

      errors.filaments[idx] = filErrors;
    });

    // Detectar duplicados de filamento
    if (new Set(filamentIds).size !== filamentIds.length) {
      errors.duplicateFilaments = true;
    }

    // 4. Validar Costos Adicionales
    additionalCostsList.forEach((c, idx) => {
      const costErrors = {};
      const trimmedName = String(c.name || "").trim();

      if (!trimmedName) {
        costErrors.name = "El concepto no puede estar vacío.";
      } else if (!REGEX_COST_NAME.test(trimmedName)) {
        costErrors.name = "Solo se permiten letras y espacios.";
      }

      if (Number(c.quantity) <= 0 || isNaN(Number(c.quantity))) {
        costErrors.quantity = "Debe ser > 0.";
      }

      if (Number(c.unitPrice) <= 0 || isNaN(Number(c.unitPrice))) {
        costErrors.unitPrice = "Debe ser > 0.";
      }

      errors.additionalCosts[idx] = costErrors;
    });

    return errors;
  };

  useEffect(() => {
    const errors = validateForm();
    setFieldErrors(errors);
  }, [selectedPrinterId, hours, minutes, selectedFilaments, additionalCostsList]);

  const getPrinterId = (printer) => {
    if (!printer) return "";
    return String(printer.id || printer._id || "");
  };

  const isMulticolor = (printer) => {
    if (!printer) return false;
    return printer.multiColour === true;
  };

  const isCurrentPrinterMulti = isMulticolor(currentPrinter);

  const handlePrinterChange = (e) => {
    setSelectedPrinterId(e.target.value);
    setTouched((prev) => ({ ...prev, printer: true }));
  };

  const handleFilamentChange = (index, field, value) => {
    const updated = [...selectedFilaments];
    updated[index][field] = value;
    setSelectedFilaments(updated);

    setTouched((prev) => {
      const updatedFilTouched = [...prev.filaments];
      updatedFilTouched[index] = { ...updatedFilTouched[index], [field]: true };
      return { ...prev, filaments: updatedFilTouched };
    });
  };

  const addFilamentRow = () => {
    if (isCurrentPrinterMulti) {
      setSelectedFilaments([...selectedFilaments, { filamentID: "", amount: 0 }]);
      setTouched((prev) => ({
        ...prev,
        filaments: [...prev.filaments, {}]
      }));
    }
  };

  const removeFilamentRow = (index) => {
    setSelectedFilaments(selectedFilaments.filter((_, i) => i !== index));
    setTouched((prev) => ({
      ...prev,
      filaments: prev.filaments.filter((_, i) => i !== index)
    }));
  };

  const handleAdditionalCostChange = (index, field, value) => {
    const updated = [...additionalCostsList];
    updated[index][field] = value;
    setAdditionalCostsList(updated);

    setTouched((prev) => {
      const updatedCostsTouched = [...prev.additionalCosts];
      updatedCostsTouched[index] = {
        ...updatedCostsTouched[index],
        [field]: true
      };
      return { ...prev, additionalCosts: updatedCostsTouched };
    });
  };

  const addAdditionalCostRow = () => {
    setAdditionalCostsList([
      ...additionalCostsList,
      { name: "", quantity: 1, unitPrice: 0 }
    ]);
    setTouched((prev) => ({
      ...prev,
      additionalCosts: [...prev.additionalCosts, {}]
    }));
  };

  const removeAdditionalCostRow = (index) => {
    setAdditionalCostsList(additionalCostsList.filter((_, i) => i !== index));
    setTouched((prev) => ({
      ...prev,
      additionalCosts: prev.additionalCosts.filter((_, i) => i !== index)
    }));
  };

  const hasAnyError = () => {
    if (fieldErrors.printer || fieldErrors.duration || fieldErrors.duplicateFilaments) {
      return true;
    }
    const hasFilamentError = fieldErrors.filaments?.some(
      (f) => Object.keys(f || {}).length > 0
    );
    const hasCostError = fieldErrors.additionalCosts?.some(
      (c) => Object.keys(c || {}).length > 0
    );
    return hasFilamentError || hasCostError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todo como interactuado
    setTouched({
      printer: true,
      duration: true,
      filaments: selectedFilaments.map(() => ({
        filamentID: true,
        amount: true
      })),
      additionalCosts: additionalCostsList.map(() => ({
        name: true,
        quantity: true,
        unitPrice: true
      }))
    });

    if (hasAnyError()) {
      setError("Por favor corrige los errores del formulario antes de continuar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      printerID: String(selectedPrinterId),
      filamentAMList: selectedFilaments.map((f) => ({
        filamentID: String(f.filamentID),
        amount: Number(f.amount)
      })),
      additionalCosts: additionalCostsList.map((c) => ({
        costName: String(c.name).trim(),
        unitPrice: Number(c.unitPrice),
        quantity: Number(c.quantity)
      })),
      hours: Number(hours),
      minutes: Number(minutes)
    };

    try {
      const response = await fetch(`${API_URL}/cost/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Ocurrió un error inesperado al calcular.");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para bordes dinámicos
  const getInputClass = (isTouched, errorMsg) => {
    if (!isTouched) return "border-gray-700 focus:ring-blue-500 focus:border-blue-500";
    if (errorMsg) return "border-red-500 focus:ring-red-500 focus:border-red-500";
    return "border-blue-500 focus:ring-blue-500 focus:border-blue-500";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 pt-2 pb-6">
      <div className="w-full flex justify-end p-2">
        <LoginButton />
      </div>

      {/* Header animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center my-3"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center bg-gradient-to-r from-blue-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
          Calculadora Emifer 3D
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "5rem" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2.5 opacity-80 shadow-sm"
        />
      </motion.div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start justify-center mt-2 mb-4">
        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-b from-gray-800 via-gray-800 to-gray-850 p-8 rounded-xl shadow-2xl w-full lg:w-1/2 border border-gray-700 overflow-hidden relative"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-gray-700/20 rounded-full blur-2xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
            {/* Campo: Impresora */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Impresora</label>
              <select
                value={selectedPrinterId}
                onChange={handlePrinterChange}
                onBlur={() => setTouched((p) => ({ ...p, printer: true }))}
                className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 border transition-colors ${getInputClass(
                  touched.printer,
                  fieldErrors.printer
                )}`}
              >
                <option value="" disabled>
                  Selecciona una impresora...
                </option>
                {printers.map((printer) => (
                  <option
                    key={getPrinterId(printer)}
                    value={getPrinterId(printer)}
                  >
                    {printer.name} {isMulticolor(printer) ? "(Multi-color)" : ""}
                  </option>
                ))}
              </select>
              <AnimatePresence>
                {touched.printer && fieldErrors.printer && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.printer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Campo: Tiempo de Impresión */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-1">Horas</label>
                  <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => {
                      setHours(e.target.value);
                      setTouched((p) => ({ ...p, duration: true }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, duration: true }))}
                    className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 border transition-colors ${getInputClass(
                      touched.duration,
                      fieldErrors.duration
                    )}`}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-1">Minutos</label>
                  <input
                    type="number"
                    min="0"
                    value={minutes}
                    onChange={(e) => {
                      setMinutes(e.target.value);
                      setTouched((p) => ({ ...p, duration: true }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, duration: true }))}
                    className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 border transition-colors ${getInputClass(
                      touched.duration,
                      fieldErrors.duration
                    )}`}
                  />
                </div>
              </div>
              <AnimatePresence>
                {touched.duration && fieldErrors.duration && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.duration}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Sección: Filamentos */}
            <div className="space-y-4">
              <label className="text-sm text-gray-400 font-semibold border-b border-gray-600 pb-1 block">
                Filamentos Usados
              </label>

              <AnimatePresence>
                {fieldErrors.duplicateFilaments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-900/40 border border-amber-500/50 text-amber-200 text-xs p-2 rounded-md"
                  >
                    ⚠️ No puedes seleccionar el mismo filamento más de una vez.
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {selectedFilaments.map((item, index) => {
                  const itemErrors = fieldErrors.filaments?.[index] || {};
                  const itemTouched = touched.filaments?.[index] || {};

                  return (
                    <motion.div
                      key={`fil-${index}`}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-2 items-start bg-gray-750 p-3 rounded-md border border-gray-700 overflow-hidden"
                    >
                      <div className="flex flex-col flex-grow">
                        <label className="text-xs text-gray-400 mb-1">
                          Material
                        </label>
                        <select
                          value={item.filamentID}
                          onChange={(e) =>
                            handleFilamentChange(index, "filamentID", e.target.value)
                          }
                          onBlur={() =>
                            setTouched((prev) => {
                              const updated = [...prev.filaments];
                              updated[index] = { ...updated[index], filamentID: true };
                              return { ...prev, filaments: updated };
                            })
                          }
                          className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputClass(
                            itemTouched.filamentID,
                            itemErrors.filamentID
                          )}`}
                        >
                          <option value="" disabled>
                            Seleccionar...
                          </option>
                          {availableFilaments.map((fil) => {
                            const filId = String(fil.id || fil._id);
                            const isAlreadySelected = selectedFilaments.some(
                              (selected, i) =>
                                i !== index && String(selected.filamentID) === filId
                            );

                            return (
                              <option
                                key={filId}
                                value={filId}
                                disabled={isAlreadySelected}
                              >
                                {fil.type} {fil.colour} - {fil.manufacturer}{" "}
                                {isAlreadySelected ? "(Ya seleccionado)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        {itemTouched.filamentID && itemErrors.filamentID && (
                          <span className="text-xs text-red-400 mt-1">
                            {itemErrors.filamentID}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col w-24">
                        <label className="text-xs text-gray-400 mb-1">
                          Cant. (g)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.amount}
                          onChange={(e) =>
                            handleFilamentChange(index, "amount", e.target.value)
                          }
                          onBlur={() =>
                            setTouched((prev) => {
                              const updated = [...prev.filaments];
                              updated[index] = { ...updated[index], amount: true };
                              return { ...prev, filaments: updated };
                            })
                          }
                          className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputClass(
                            itemTouched.amount,
                            itemErrors.amount
                          )}`}
                        />
                        {itemTouched.amount && itemErrors.amount && (
                          <span className="text-xs text-red-400 mt-1">
                            {itemErrors.amount}
                          </span>
                        )}
                      </div>

                      {selectedFilaments.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => removeFilamentRow(index)}
                          className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-md transition-colors mt-6"
                        >
                          ✕
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isCurrentPrinterMulti && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addFilamentRow}
                  className="w-full border-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors py-2 rounded-md text-sm font-semibold"
                >
                  + Agregar otro filamento
                </motion.button>
              )}
            </div>

            {/* Sección: Costos Adicionales */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-600 pb-1">
                <label className="text-sm text-gray-400 font-semibold">
                  Costos Adicionales (Opcional)
                </label>
              </div>

              <AnimatePresence initial={false}>
                {additionalCostsList.map((item, index) => {
                  const itemErrors = fieldErrors.additionalCosts?.[index] || {};
                  const itemTouched = touched.additionalCosts?.[index] || {};

                  return (
                    <motion.div
                      key={`cost-${index}`}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-2 items-start bg-gray-750 p-3 rounded-md border border-gray-700 overflow-hidden"
                    >
                      <div className="flex flex-col flex-grow">
                        <label className="text-xs text-gray-400 mb-1">
                          Concepto
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Pintura, Tornillos"
                          value={item.name}
                          onChange={(e) =>
                            handleAdditionalCostChange(index, "name", e.target.value)
                          }
                          onBlur={() =>
                            setTouched((prev) => {
                              const updated = [...prev.additionalCosts];
                              updated[index] = { ...updated[index], name: true };
                              return { ...prev, additionalCosts: updated };
                            })
                          }
                          className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputClass(
                            itemTouched.name,
                            itemErrors.name
                          )}`}
                        />
                        {itemTouched.name && itemErrors.name && (
                          <span className="text-xs text-red-400 mt-1">
                            {itemErrors.name}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col w-20">
                        <label className="text-xs text-gray-400 mb-1">
                          Cant.
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleAdditionalCostChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            setTouched((prev) => {
                              const updated = [...prev.additionalCosts];
                              updated[index] = {
                                ...updated[index],
                                quantity: true
                              };
                              return { ...prev, additionalCosts: updated };
                            })
                          }
                          className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputClass(
                            itemTouched.quantity,
                            itemErrors.quantity
                          )}`}
                        />
                        {itemTouched.quantity && itemErrors.quantity && (
                          <span className="text-xs text-red-400 mt-1">
                            {itemErrors.quantity}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col w-24">
                        <label className="text-xs text-gray-400 mb-1">
                          Precio Un.
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleAdditionalCostChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            setTouched((prev) => {
                              const updated = [...prev.additionalCosts];
                              updated[index] = {
                                ...updated[index],
                                unitPrice: true
                              };
                              return { ...prev, additionalCosts: updated };
                            })
                          }
                          className={`bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 text-sm border transition-colors ${getInputClass(
                            itemTouched.unitPrice,
                            itemErrors.unitPrice
                          )}`}
                        />
                        {itemTouched.unitPrice && itemErrors.unitPrice && (
                          <span className="text-xs text-red-400 mt-1">
                            {itemErrors.unitPrice}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => removeAdditionalCostRow(index)}
                        className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-md transition-colors mt-6"
                      >
                        ✕
                      </motion.button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={addAdditionalCostRow}
                className="w-full border-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors py-2 rounded-md text-sm font-semibold"
              >
                + Agregar costo adicional
              </motion.button>
            </div>

            {/* Error global */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm font-semibold bg-red-950/40 border border-red-800 p-2.5 rounded-md"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: hasAnyError() ? 1 : 1.02 }}
              whileTap={{ scale: hasAnyError() ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading || hasAnyError()}
              className={`w-full font-bold py-3 rounded-md mt-4 transition-colors shadow-md ${
                hasAnyError()
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isLoading ? "Calculando..." : "Calcular Costo Final"}
            </motion.button>
          </form>
        </motion.div>

        {/* Tarjeta de Resultados */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30, x: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: 0,
                borderColor: [
                  "rgba(59, 130, 246, 0.3)",
                  "rgba(59, 130, 246, 1)",
                  "rgba(59, 130, 246, 0.3)"
                ],
                boxShadow: [
                  "0 10px 25px -5px rgba(59, 130, 246, 0.1)",
                  "0 20px 35px 2px rgba(59, 130, 246, 0.35)",
                  "0 10px 25px -5px rgba(59, 130, 246, 0.1)"
                ]
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                duration: 0.4,
                borderColor: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="bg-gradient-to-b from-gray-800 via-gray-800 to-gray-850 border-2 p-8 rounded-xl w-full lg:w-1/2 sticky top-4 overflow-hidden relative"
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center mb-6 pb-4 border-b border-gray-700/80">
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full inline-block mb-3">
                  Resumen del Cálculo
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                    ${result.finalCost?.toFixed(2) || "0.00"}
                  </span>
                </h2>
                <p className="text-emerald-400 text-base font-semibold mt-1.5 flex items-center justify-center gap-1">
                  <span>Ganancia estimada:</span>
                  <span className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    ${result.profit?.toFixed(2) || "0.00"}
                  </span>
                </p>
              </div>

              <div className="space-y-4 text-sm relative z-10">
                <div className="bg-gray-750/90 p-4 rounded-lg border border-gray-700 shadow-inner">
                  <h3 className="text-base font-semibold text-gray-200 mb-3 border-b border-gray-600/70 pb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    Uso de Impresora
                  </h3>
                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Electricidad:</span>
                    <span className="font-semibold text-white">
                      ${result.printerCost?.wattsCost?.toFixed(2) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Desgaste:</span>
                    <span className="font-semibold text-white">
                      ${result.printerCost?.wearCostPrint?.toFixed(2) || 0}
                    </span>
                  </div>
                </div>

                {result.filamentCosts && result.filamentCosts.length > 0 && (
                  <div className="bg-gray-750/90 p-4 rounded-lg border border-gray-700 shadow-inner">
                    <h3 className="text-base font-semibold text-gray-200 mb-3 border-b border-gray-600/70 pb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                      Filamentos
                    </h3>
                    {result.filamentCosts.map((fc, idx) => {
                      const filInfo = availableFilaments.find(
                        (f) => String(f.id || f._id) === String(fc.filamentID)
                      );
                      const filName = filInfo
                        ? `${filInfo.type} ${filInfo.colour}`
                        : `ID: ${fc.filamentID}`;
                      return (
                        <div
                          key={`res-fil-${idx}`}
                          className="flex justify-between text-gray-300 mb-2 last:mb-0"
                        >
                          <span>
                            {filName} ({fc.amount}g):
                          </span>
                          <span className="font-semibold text-white">
                            ${fc.finalCost?.toFixed(2) || 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {result.additionalCost && result.additionalCost.length > 0 && (
                  <div className="bg-gray-750/90 p-4 rounded-lg border border-gray-700 shadow-inner">
                    <h3 className="text-base font-semibold text-gray-200 mb-3 border-b border-gray-600/70 pb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Costos Adicionales
                    </h3>
                    {result.additionalCost.map((ac, idx) => (
                      <div
                        key={`res-add-${idx}`}
                        className="flex justify-between text-gray-300 mb-2 last:mb-0"
                      >
                        <span>
                          {ac.costName} (x{ac.quantity}):
                        </span>
                        <span className="font-semibold text-white">
                          ${ac.totalCost?.toFixed(2) || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}