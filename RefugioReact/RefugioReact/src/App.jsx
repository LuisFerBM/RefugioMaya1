import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Animales from "./components/animales/animales";
import Home from "./components/home/Home";
import Login from "./components/home/login/Login";
import 'bootstrap/dist/css/bootstrap.min.css';
import Perfil from "./components/perfil/Perfil";
 import Registro from "./components/home/registro/Registro";
import Admin from "./components/admin/Admin";
import AdminAnimales from "./components/admin/AdminAnimales";
import AdminCitas from "./components/admin/AdminCitas";
import AdminUsuarios from "./components/admin/AdminUsuarios";
import Voluntarios from "./components/voluntarios/voluntarios";
import AdminVoluntarios from "./components/admin/AdminVoluntarios";
import Estado from "./components/estado/Estado";
import Footer from "./footer/Footer";
import AdminEstados from "./components/admin/AdminEstados";
import { ApiProvider } from './context/apiContext';

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // Ajusta este valor entre 0.1 y 1.0
    }
  }, []);

  return (
    <>
         <ApiProvider>

      <div className="content-container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
             <Route path="/usuarios/registro" element={<Registro />} />
            <Route path="/animales" element={<Animales />} />
            <Route path="/login" element={<Login />} /> {/* Añadir cuando tengas el componente de registro */}
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/adminAnimales" element={<AdminAnimales />} />
            <Route path="/admin/adminUsuarios" element={<AdminUsuarios />} />
            <Route path="/admin/adminCitas" element={<AdminCitas />} />
            <Route path="/admin/adminVoluntarios" element={<AdminVoluntarios />} />
            <Route path="/admin/adminEstados" element={<AdminEstados />} />
            <Route path="/voluntarios" element={<Voluntarios />} />
            <Route path="/estado" element={<Estado />} />
            <Route path="/" element={<Footer />} />

           </Routes>
        </BrowserRouter>
      </div>
      </ApiProvider>
    </>
  ); 
}

export default App;
