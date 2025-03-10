import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  ButtonGroup,
  Button,
  CardBody,
  Form,
  Modal,
} from "react-bootstrap";
import {  Link } from "react-router-dom";
import "./Animales.css";
import video from "../../assets/video/video.mp4"; // Corregida la ruta
import { ApiContext } from "../../context/apiContext"; // Importamos el contexto de la API

const Animales = () => {
  const { animales, allAnimales, handleCardClick, showModal, setShowModal, estado, modalAnimal } = useContext(ApiContext); // Importamos el estado y la función de la API
  const [user, setUser] = useState(null);

  const [filtro, setFiltro] = useState("todos"); // Añadido el estado filtro
   
  useEffect(() => {
    allAnimales();
  }, []);

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  const animalesFiltrados = () => {
    if (!animales) return [];
    switch (filtro) {
      case "adoptado":
        return animales.filter(
          (animal) => animal.estado_adopcion === "adoptado"
        );
      case "disponible":
        return animales.filter(
          (animal) => animal.estado_adopcion !== "adoptado"
        );
      default:
        return animales;
    }
  };
 
  const videoRef = useRef(null);

  const scrollToTop = () => {
    const contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
      contentWrapper.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  return (
    <>
      <div className="video-container">
        <video ref={videoRef} className="video_background" autoPlay loop muted>
          <source src={video} type="video/mp4" />
        </video>
      </div>
      {/* Modal de Estado y Cita */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered // Añade esta prop para centrar el modal
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{modalAnimal?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h5 className="border-bottom pb-2">Estado del Animal</h5>
              {estado ? (
                <>
                  <p>
                    <strong>Salud:</strong> {estado.salud || "No registrada"}
                  </p>
                  <p>
                    <strong>Comportamiento:</strong>{" "}
                    {estado.comportamiento || "No registrado"}
                  </p>
                  <p>
                    <strong>Alimentación:</strong>{" "}
                    {estado.alimentacion || "No registrada"}
                  </p>
                  <p>
                    <strong>Ubicación:</strong>{" "}
                    {estado.ubicacion || "No registrada"}
                  </p>
                </>
              ) : (
                <p className="text-muted">
                  No hay información de estado disponible
                </p>
              )}
            </Col>
            <Col md={6} className="border-start">
              <h5 className="border-bottom pb-2">Agendar Cita</h5>
              {user ? (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const nuevaCita = {
                      usuario_id: parseInt(user.id),
                      animal_id: parseInt(modalAnimal.id), // Usamos el ID del animal del modal
                      fecha: e.target.fecha.value,
                      nombre_usuario: user.nombre,
                      nombre_animal: modalAnimal.nombre,
                    };

                    fetch("http://localhost:3000/citas/add", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(nuevaCita),
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        if (data.error) {
                          throw new Error(
                            data.body || "Error al crear la cita"
                          );
                        }
                        alert("Cita agendada correctamente");
                        setShowModal(false);
                      })
                      .catch((error) => {
                        console.error("Error al crear cita:", error);
                        alert("Error al crear la cita: " + error.message);
                      });
                  }}>
                  <Form.Group className="mb-3">
                    <Form.Label>Animal seleccionado</Form.Label>
                    <Form.Control
                      type="text"
                      value={modalAnimal?.nombre || ""}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de visita</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Agendar Cita
                  </Button>
                </Form>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-3">
                    Debe iniciar sesión para agendar una cita
                  </p>
                  <Button as={Link} to="/login" variant="outline-primary">
                    Iniciar Sesión
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="content-wrapper">
        {/* Barra de navegación */}
        <Container fluid className="mb-4">
          <Row className="justify-content-between align-items-center">
            <Col>
              <Button
                as={Link}
                to="/home"
                variant="outline-light"
                className="m-2">
                Volver al Menú
              </Button>
            </Col>
            {user && (
              <Col className="text-end">
                <span className="user-welcome">Bienvenido, {user.nombre}</span>
              </Col>
            )}
          </Row>
        </Container>

        {/* Contenido principal */}
        <Container className="mt-4">
          <h2 className="text-center mb-4 text-white">Animales en Adopción</h2>

          {/* Filtros */}
          <div className="d-flex justify-content-center mb-4">
            <ButtonGroup>
              <Button
                variant={filtro === "todos" ? "primary" : "outline-primary"}
                onClick={() => setFiltro("todos")}>
                Todos
              </Button>
              <Button
                variant={
                  filtro === "disponible" ? "primary" : "outline-primary"
                }
                onClick={() => setFiltro("disponible")}>
                Disponibles
              </Button>
              <Button
                variant={filtro === "adoptado" ? "primary" : "outline-primary"}
                onClick={() => setFiltro("adoptado")}>
                Adoptados
              </Button>
            </ButtonGroup>
          </div>

          {/* Lista de animales */}
          {animalesFiltrados().length === 0 ? (
            <p className="text-center">No hay animales disponibles</p>
          ) : (
            <Row className="g-4">
              {animalesFiltrados().map((animal) => (
                <Col xs={12} sm={6} md={4} lg={3} key={animal.id}>
                  <Card
                    className="h-100"
                    bg={
                      animal.estado_adopcion === "adoptado"
                        ? "secondary"
                        : "info"
                    }
                    style={{
                      borderWidth: "3px",
                      cursor:
                        animal.estado_adopcion !== "adoptado"
                          ? "pointer"
                          : "default",
                    }}
                    onClick={() => handleCardClick(animal)}>
                    {animal.imagen ? (
                      <Card.Img
                        variant="top"
                        src={animal.imagen}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // Cambiado de 'contain' a 'cover'
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <h3 className="text-muted fs-6">Sin imagen</h3>
                      </div>
                    )}
                    <Card.Body>
                      <Card.Title className="h6 text-truncate">
                        {animal.nombre}
                      </Card.Title>
                      <Card.Text as="div" className="small">
                        <div className="mb-1 text-truncate">
                          Edad: {animal.edad} años
                        </div>
                        <div className="mb-1 text-truncate">
                          Especie:{" "}
                          {animal.id_especie === 1
                            ? "Gato"
                            : animal.id_especie === 2
                            ? "Perro"
                            : animal.id_especie}
                        </div>
                        <div className="mb-1 text-truncate">
                          Estado:{" "}
                          {animal.estado_adopcion === "adoptado"
                            ? "Adoptado"
                            : "Disponible"}
                        </div>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
      <Button
        className="scroll-to-top"
        onClick={scrollToTop}
        aria-label="Volver al inicio">
        ↑
      </Button>
    </>
  );
};

export default Animales;
