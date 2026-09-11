import { Route, Routes, useLocation } from 'react-router-dom';
import InitialPage from "./pages/InitialPage";
import './App.css';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './middleware/ProtectedRoute';
import Filaments from './pages/Filament';
import Costs from './pages/Costs';
import PrintersManager from './pages/Printers';
import Footer from './components/Footer';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <main className="flex-grow">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<InitialPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
          <Route path="/admin/printers" element={<ProtectedRoute element={<PrintersManager />} />} />
          <Route path="/admin/filaments" element={<ProtectedRoute element={<Filaments />} />} />
          <Route path="/admin/costs" element={<ProtectedRoute element={<Costs />} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}