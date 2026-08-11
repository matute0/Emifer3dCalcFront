import { useNavigate } from "react-router-dom";

export default function LoginButton(){
    const navigate = useNavigate();
    const handleGoToLogin = () =>{
        navigate("/login");
    };
    return(
        <>
        <button
        onClick={handleGoToLogin}
      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      > Iniciar Sesión
    </button>  
        </>
    )
}