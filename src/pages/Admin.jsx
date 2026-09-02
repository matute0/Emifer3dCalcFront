import { Link, useNavigate } from "react-router-dom";

export default function AdminMenu() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/user/logout`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-8">
      
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestiona los recursos base de la calculadora
          </p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-red-200 bg-gradient-to-r from-red-950/60 via-red-900/40 to-rose-950/60 border border-red-500/30 hover:border-red-400/80 shadow-lg hover:shadow-red-500/20 hover:text-white transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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
          
          <span className="relative z-10">{"Cerrar Sesión"}</span>
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <Link
            key={index}
            to={section.path}
            className="group bg-gray-800 border border-gray-700 hover:border-blue-500/50 p-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-gray-700/50 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
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
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}