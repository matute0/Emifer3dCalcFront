import {useEffect, useState, type ReactElement} from "react";
import { getUserAuth, isUserAuth } from "../api/UserAPI";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    element: ReactElement;
}
export default function ProtectedRoute({element}: ProtectedRouteProps){
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
    const minLoadingTime = 700;
    const checkAuth = async () =>{
        const start = performance.now();
        try{
            const valid = await isUserAuth();
            if(!valid){
                setAuthorized(false)
                return;
            } else {
                const user = await getUserAuth();
                if(!user){
                    setAuthorized(false);
                    return;
                }
                const elapsed = performance.now() - start;
                const remaining = minLoadingTime - elapsed;

                setTimeout(() => {
                    setAuthorized(true);
                }, remaining > 0 ? remaining : 0);
            }
        } catch {
            setAuthorized(false);
        }
    };
    checkAuth();
    }, []);
    if(authorized === null){
        return <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      
      <p className="text-sm font-medium text-gray-400 tracking-wide animate-pulse">
        Cargando...
      </p>
    </div>
    }
    if(!authorized){
        return <Navigate to="/login" replace/>;
    }
    return element;
}