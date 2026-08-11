import {Route, Routes, useLocation } from 'react-router-dom'
import InitialPage from "./pages/InitialPage"
import './App.css'
import Login from './pages/Login';

export default function App() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<InitialPage/>} />
      <Route path="/login" element={<Login/>}/>
    </Routes>
  )
}

