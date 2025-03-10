import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const Voluntarios = () => {
  const nombreRef = useRef();
  const emailRef = useRef();
  const telefonoRef = useRef();
  const formularioRef = useRef();
  const [animales, setAnimales] = useState([]);

  // Obtener lista de animales
  useEffect(() => {
    const fetchAnimales = async () => {
      try {
        const response = await fetch("http://localhost:3000/animales");
        if (response.ok) {
          const data = await response.json();
          setAnimales(data.body || []);
        }
      } catch (error) {
        console.error("Error al obtener animales:", error);
      }
    };
    fetchAnimales();
  }, []);
  
  const voluntarioRegistro = async (e) => {
    e.preventDefault();
    
    // Seleccionar un animal aleatorio que necesite ayuda
    const animalesDisponibles = animales.filter(animal => animal.estado_adopcion === "no adoptado");
    const animalAleatorio = animalesDisponibles[Math.floor(Math.random() * animalesDisponibles.length)];

    const voluntarioData = {
      nombre: nombreRef.current.value,
      email: emailRef.current.value,
      telefono: telefonoRef.current.value,
      id_animal: animalAleatorio.id
    };

    try {
      const response = await fetch("http://localhost:3000/voluntarios/unirse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voluntarioData),
      });

      if (response.ok) {
        alert(`¡Gracias por registrarte como voluntario! Has sido asignado para ayudar a uno de nuestros animales !!!.`);
        formularioRef.current.reset();
      } else {
        throw new Error("Error al enviar el formulario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el formulario");
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-between mb-4">
        <Col>
          <Button as={Link} to="/home" variant="primary">
            Volver al Menú
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2 className="mb-0">Únete a Nuestro Equipo de Voluntarios</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-center mb-4">
                Tu ayuda es valiosa para nosotros. Completa el formulario y serás asignado
                a un animal que necesita tu ayuda.
              </p>

              <Form ref={formularioRef} onSubmit={voluntarioRegistro}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    type="text"
                    ref={nombreRef}
                    required
                    placeholder="Ingresa tu nombre completo"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    ref={emailRef}
                    required
                    placeholder="ejemplo@email.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    ref={telefonoRef}
                    required
                    placeholder="Tu número de teléfono"
                  />
                </Form.Group>

                <div className="text-center">
                  <Button type="submit" variant="primary" size="lg">
                    Enviar Solicitud
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Voluntarios;