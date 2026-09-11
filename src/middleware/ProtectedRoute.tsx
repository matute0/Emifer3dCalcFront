import { useEffect, useState, type ReactElement } from "react";
import { getUserAuth, isUserAuth } from "../api/UserAPI";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ProtectedRouteProps {
  element: ReactElement;
}

export default function ProtectedRoute({ element }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const minLoadingTime = 700;
    const checkAuth = async () => {
      const start = performance.now();
      try {
        const valid = await isUserAuth();
        if (!valid) {
          setAuthorized(false);
          return;
        }
        const user = await getUserAuth();
        if (!user) {
          setAuthorized(false);
          return;
        }
        const elapsed = performance.now() - start;
        const remaining = minLoadingTime - elapsed;

        setTimeout(() => {
          setAuthorized(true);
        }, remaining > 0 ? remaining : 0);
      } catch {
        setAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  if (authorized === false) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {authorized === null ? (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          >
            {/* Spinner animado */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-9 h-9 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full"
            />

            {/* Texto de carga pulsante */}
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-sm font-medium text-gray-400 tracking-wide"
            >
              Cargando...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="protected-content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full min-h-screen bg-gray-900"
          >
            {element}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}