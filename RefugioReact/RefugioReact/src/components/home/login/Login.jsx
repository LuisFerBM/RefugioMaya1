import React, { useRef, useState, useEffect } from "react";
import { Button, Form, Alert, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
   const navigate = useNavigate();
  const formularioRef = useRef(null);
 
  // Verificar si ya hay sesión activa
    useEffect(() => {
           const storedUser = localStorage.getItem("user");
           if (storedUser) {
               const userData = JSON.parse(storedUser);
               setUser(userData);
           }
       }, []);
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
};


  const accesoPermitido = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = {
      email: formularioRef.current.formBasicEmail.value,
      password: formularioRef.current.formBasicPassword.value,
    };

    try {
      const response = await fetch("http://localhost:3000/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      localStorage.setItem("user", JSON.stringify(data.body));
      navigate("/home");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  return (



    <Container className="mt-5">


{user ?  (
          <div className="d-flex justify-content-between align-items-center mb-4">  
            <h1>Bienvenido, {user.nombre}</h1>
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>    
          </div>
        ) : (
          

      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Iniciar Sesión</h1>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={accesoPermitido} ref={formularioRef}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese su correo"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese su contraseña"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              Ingresar
            </Button>

            <div className="text-center">
              <Link to="/" className="me-2">Volver al inicio</Link>
              <span>|</span>
              <Link to="/usuarios/registro" className="ms-2">Registrarse</Link>
            </div>
          </Form>
        </div>
      </div>
        )}
    </Container>    
  );
};

export default Login;
