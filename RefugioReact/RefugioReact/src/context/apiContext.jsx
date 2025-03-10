// src/context/ApiContext.js
import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const ApiContext = createContext();

// Crear el proveedor del contexto
export const ApiProvider = ({ children }) => {
  const [animales, setAnimales] = useState([]);
 const [modalAnimal, setModalAnimal] = useState(null);
  const [estado, setEstado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Función para obtener todos los animales
  const allAnimales = async () => {
    try {
      const peticion = await fetch("http://localhost:3000/animales");
      if (!peticion.ok) {
        throw new Error("Error en la petición");
      }
      const datos = await peticion.json();
      setAnimales(datos.body || []);
    } catch (error) {
      console.error("Error al obtener animales:", error);
      setAnimales([]);
    }
  };
  
  // Cargar animales al iniciar
  useEffect(() => {
    allAnimales();
  }, []);
  
  // Valores a compartir en el contexto
   
  const handleCardClick = async (animal) => {
    if (animal.estado_adopcion !== "adoptado") {
      setModalAnimal(animal);

      try {
        // Console log para depuración
        console.log(`Consultando estado para animal ID: ${animal.id}`);

        // Crear la URL correctamente
        const url = `http://localhost:3000/estado/animal/${animal.id}`;
        console.log("URL:", url);

        const response = await fetch(url);
        console.log("Respuesta:", response);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);

        if (data && data.body) {
          console.log("Estado encontrado:", data.body);
          setEstado(data.body);
        } else {
          console.log("No se encontró estado para este animal");
          setEstado(null);
        }
      } catch (error) {
        console.error("Error al obtener estado:", error);
        setEstado(null);
      } finally {
        setShowModal(true);
      }
    }
  };

  const contextValue = {
    animales,
    setAnimales,
    allAnimales,
    handleCardClick,
    estado,
    setEstado,
    showModal,
    setShowModal,
    modalAnimal
  };



  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};