import {Route, Routes, useLocation } from 'react-router-dom'
import InitialPage from "./pages/InitialPage"
import './App.css'
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './middleware/ProtectedRoute';
import Printers from './pages/Printers';
import Filaments from './pages/Filament';
import Costs from './pages/Costs';

export default function App() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<InitialPage/>} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/admin" element={<ProtectedRoute element={<Admin/>}/>}/>
      <Route path="/admin/printers" element={<ProtectedRoute element={<Printers/>}/>}/>
      <Route path="/admin/filaments" element={<ProtectedRoute element={<Filaments/>}/>}/>
      <Route path="/admin/costs" element={<ProtectedRoute element={<Costs/>}/>}/>
    </Routes>
  )
}

