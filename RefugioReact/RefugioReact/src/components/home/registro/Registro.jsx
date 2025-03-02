import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Card, Container, Alert } from "react-bootstrap";
import { useState, useRef } from "react";

const Registro = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const formularioRef1 = useRef(null);

  const registroUsuario = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const nuevo = {
        nombre: formularioRef1.current["nombre"].value.trim(),
        password: formularioRef1.current["password"].value.trim(),
        email: formularioRef1.current["email"].value.trim(),
      };

      // Validaciones mejoradas
      if (!nuevo.nombre) {
        throw new Error("El nombre de usuario es obligatorio");
      }
      if (!nuevo.password || nuevo.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }
      if (!nuevo.email || !nuevo.email.includes('@')) {
        throw new Error("Por favor, ingrese un email válido");
      }

      console.log('Datos a enviar:', nuevo);

      const peticion = await fetch(
        "http://localhost:3000/usuarios/registro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevo),
        }
      );

      const datos = await peticion.json();
      console.log('Respuesta del servidor:', datos);

      if (!peticion.ok) {
        throw new Error(datos.message || "Error en el registro");
      }

      setError({ type: 'success', message: 'Registro exitoso' });
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Error detallado:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mt-4 mb-4 p-4 shadow bg-body rounded w-50 mx-auto">
        <Card.Title>Registro</Card.Title>
        <Card.Body>
          {error && (
            <Alert 
              variant={typeof error === 'object' && error.type === 'success' ? 'success' : 'danger'} 
              dismissible
            >
              {typeof error === 'object' ? error.message : error}
            </Alert>
          )}
          <Form onSubmit={registroUsuario} ref={formularioRef1}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre"
                name="nombre"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" name="email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <Row className="mt-3">
        <Col className="text-center">
          <Button variant="outline-primary" as={Link} to="/login">
            Ya tengo cuenta
          </Button>
        </Col>
        <Col className="text-center">
          <Button variant="outline-secondary" as={Link} to="/Home">
            Volver a inicio
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Registro;
