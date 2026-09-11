import { useNavigate } from "react-router-dom";

export default function LoginButton(){
    const navigate = useNavigate();
    const handleGoToLogin = () =>{
        navigate("/admin");
    };
    return(
        <>
        <button
  onClick={handleGoToLogin}
  className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-emerald-200 bg-gradient-to-r from-emerald-950/60 via-teal-900/40 to-cyan-950/60 border border-emerald-500/30 hover:border-emerald-400/80 shadow-lg hover:shadow-emerald-500/20 hover:text-white transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
>
  {/* Destello de luz diagonal */}
  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

  {/* Ícono dinámico de Inicio de Sesión */}
  <svg
    className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-transform duration-300 group-hover:translate-x-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 16l4-4m0 0l-4-4m4 4H3m6 4v1a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3h-4a3 3 0 00-3 3v1"
    />
  </svg>

  <span className="relative z-10">Iniciar Sesión</span>
</button>
        </>
    )
}