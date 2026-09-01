import { useState, useEffect } from "react";
import LoginButton from "../components/LoginButton";

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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [printersResponse, filamentsResponse] = await Promise.all([
          fetch(`${API_URL}/printer/list`),
          fetch(`${API_URL}/filament/get`)
        ]);

        if (printersResponse.ok) {
          const printersData = await printersResponse.json();
          setPrinters(printersData);
        }
        
        if (filamentsResponse.ok) {
          const filamentsData = await filamentsResponse.json();
          setAvailableFilaments(filamentsData);
        }
      } catch (err) {
        console.error(err);
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
            setSelectedFilaments(prev => [prev[0]]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCurrentPrinter();
  }, [selectedPrinterId, API_URL]);

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
  };

  const handleFilamentChange = (index, field, value) => {
    const updated = [...selectedFilaments];
    updated[index][field] = value;
    setSelectedFilaments(updated);
  };

  const addFilamentRow = () => {
    if (isCurrentPrinterMulti) {
      setSelectedFilaments([...selectedFilaments, { filamentID: "", amount: 0 }]);
    }
  };

  const removeFilamentRow = (index) => {
    setSelectedFilaments(selectedFilaments.filter((_, i) => i !== index));
  };

  const handleAdditionalCostChange = (index, field, value) => {
    const updated = [...additionalCostsList];
    updated[index][field] = value;
    setAdditionalCostsList(updated);
  };

  const addAdditionalCostRow = () => setAdditionalCostsList([...additionalCostsList, { name: "", quantity: 1, unitPrice: 0 }]);
  
  const removeAdditionalCostRow = (index) => setAdditionalCostsList(additionalCostsList.filter((_, i) => i !== index));

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Validación de filamentos duplicados
    const filamentIds = selectedFilaments
      .map(f => String(f.filamentID))
      .filter(id => id !== "");

    const hasDuplicates = new Set(filamentIds).size !== filamentIds.length;

    if (hasDuplicates) {
      setError("No puedes seleccionar el mismo filamento más de una vez.");
      setIsLoading(false);
      return;
    }

    const payload = {
      printerID: String(selectedPrinterId),
      filamentAMList: selectedFilaments.map(f => ({
        filamentID: String(f.filamentID), 
        amount: Number(f.amount)
      })),
      additionalCosts: additionalCostsList.map(c => ({
        costName: String(c.name),
        unitPrice: Number(c.unitPrice),
        quantity: Number(c.quantity)
      })),
      hours: Number(hours),
      minutes: Number(minutes)
    };

    try {
      const response = await fetch(`${API_URL}/cost/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al calcular el costo. Revisa la conexión o los datos enviados.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 pt-2 pb-6">
      <div className="w-full flex justify-end p-2">
        <LoginButton />
      </div>

      {/* Encabezado decorado de forma sobria y moderna */}
      <div className="flex flex-col items-center my-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center bg-gradient-to-r from-blue-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
          Calculadora Emifer 3D
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2.5 opacity-80 shadow-sm" />
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start justify-center mt-2 mb-4">
        
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full lg:w-1/2">
          <form onSubmit={handleCalculate} className="space-y-6">
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Impresora</label>
              <select 
                required
                value={selectedPrinterId} 
                onChange={handlePrinterChange}
                className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              >
                <option value="" disabled>Selecciona una impresora...</option>
                {printers.map(printer => (
                  <option key={getPrinterId(printer)} value={getPrinterId(printer)}>
                    {printer.name} {isMulticolor(printer) ? "(Multi-color)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Horas</label>
                <input 
                  type="number" min="0" required
                  value={hours} 
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Minutos</label>
                <input 
                  type="number" min="0" required
                  value={minutes} 
                  onChange={(e) => setMinutes(e.target.value)}
                  className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm text-gray-400 font-semibold border-b border-gray-600 pb-1 block">
                Filamentos Usados
              </label>
              
              {selectedFilaments.map((item, index) => (
                <div key={`fil-${index}`} className="flex gap-2 items-end bg-gray-750 p-3 rounded-md border border-gray-700">
                  <div className="flex flex-col flex-grow">
                    <label className="text-xs text-gray-400 mb-1">Material</label>
                    <select 
                      required
                      value={item.filamentID} 
                      onChange={(e) => handleFilamentChange(index, "filamentID", e.target.value)}
                      className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    >
                      <option value="" disabled>Seleccionar...</option>
                      {availableFilaments.map(fil => {
                        const filId = String(fil.id || fil._id);
                        const isAlreadySelected = selectedFilaments.some(
                          (selected, i) => i !== index && String(selected.filamentID) === filId
                        );

                        return (
                          <option 
                            key={filId} 
                            value={filId} 
                            disabled={isAlreadySelected}
                          >
                            {fil.type} {fil.colour} - {fil.manufacturer} {isAlreadySelected ? "(Ya seleccionado)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="flex flex-col w-24">
                    <label className="text-xs text-gray-400 mb-1">Cant. (g)</label>
                    <input 
                      type="number" min="0" required step="any"
                      value={item.amount} 
                      onChange={(e) => handleFilamentChange(index, "amount", e.target.value)}
                      className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                  {selectedFilaments.length > 1 && (
                    <button 
                      type="button" onClick={() => removeFilamentRow(index)}
                      className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-md transition-colors"
                    >✕</button>
                  )}
                </div>
              ))}
              
              {isCurrentPrinterMulti && (
                <button 
                  type="button" onClick={addFilamentRow}
                  className="w-full border-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors py-2 rounded-md text-sm font-semibold"
                >
                  + Agregar otro filamento
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-600 pb-1">
                <label className="text-sm text-gray-400 font-semibold">Costos Adicionales (Opcional)</label>
              </div>
              
              {additionalCostsList.map((item, index) => (
                <div key={`cost-${index}`} className="flex gap-2 items-end bg-gray-750 p-3 rounded-md border border-gray-700">
                  <div className="flex flex-col flex-grow">
                    <label className="text-xs text-gray-400 mb-1">Concepto</label>
                    <input 
                      type="text" required placeholder="Ej: Pintura, Tornillos..."
                      value={item.name} 
                      onChange={(e) => handleAdditionalCostChange(index, "name", e.target.value)}
                      className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                  <div className="flex flex-col w-20">
                    <label className="text-xs text-gray-400 mb-1">Cant.</label>
                    <input 
                      type="number" min="1" required step="any"
                      value={item.quantity} 
                      onChange={(e) => handleAdditionalCostChange(index, "quantity", e.target.value)}
                      className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                  <div className="flex flex-col w-24">
                    <label className="text-xs text-gray-400 mb-1">Precio Un.</label>
                    <input 
                      type="number" min="0" required step="any"
                      value={item.unitPrice} 
                      onChange={(e) => handleAdditionalCostChange(index, "unitPrice", e.target.value)}
                      className="bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                  <button 
                    type="button" onClick={() => removeAdditionalCostRow(index)}
                    className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-md transition-colors"
                  >✕</button>
                </div>
              ))}
              
              <button 
                type="button" onClick={addAdditionalCostRow}
                className="w-full border-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors py-2 rounded-md text-sm font-semibold"
              >
                + Agregar costo adicional
              </button>
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading || !selectedPrinterId}
              className="w-full bg-blue-600 hover:bg-blue-500 transition-colors font-bold py-3 rounded-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Calculando..." : "Calcular Costo Final"}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-gray-800 border border-gray-600 p-8 rounded-xl shadow-lg w-full lg:w-1/2 transition-all animate-fade-in sticky top-4">
            <h2 className="text-3xl font-bold mb-2 text-center text-blue-400">
              Costo Final: ${result.finalCost?.toFixed(2) || 0}
            </h2>
            <p className="text-green-400 text-center text-lg font-semibold mb-6">
              Ganancia: ${result.profit?.toFixed(2) || 0}
            </p>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-600 pb-1">Uso de Impresora</h3>
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Electricidad:</span>
                  <span className="font-medium">${result.printerCost?.wattsCost?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Desgaste:</span>
                  <span className="font-medium">${result.printerCost?.wearCostPrint?.toFixed(2) || 0}</span>
                </div>
              </div>

              {result.filamentCosts && result.filamentCosts.length > 0 && (
                <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-600 pb-1">Filamentos</h3>
                  {result.filamentCosts.map((fc, idx) => {
                    const filInfo = availableFilaments.find(f => (f.id || f._id) === fc.filamentID);
                    const filName = filInfo ? `${filInfo.type} ${filInfo.colour}` : `ID: ${fc.filamentID}`;
                    return (
                      <div key={`res-fil-${idx}`} className="flex justify-between text-gray-300 mb-2 last:mb-0">
                        <span>{filName} ({fc.amount}g):</span>
                        <span className="font-medium">${fc.finalCost?.toFixed(2) || 0}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {result.additionalCost && result.additionalCost.length > 0 && (
                <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-600 pb-1">Costos Adicionales</h3>
                  {result.additionalCost.map((ac, idx) => (
                    <div key={`res-add-${idx}`} className="flex justify-between text-gray-300 mb-2 last:mb-0">
                      <span>{ac.costName} (x{ac.quantity}):</span>
                      <span className="font-medium">${ac.totalCost?.toFixed(2) || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}