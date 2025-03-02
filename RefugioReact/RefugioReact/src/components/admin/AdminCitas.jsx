import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const formularioRef = useRef(null);

  const allCitas = async () => {
    try {
      // Usar la nueva ruta específica para el usuario
      const peticion = await fetch(`http://localhost:3000/citas`);

      if (!peticion.ok) {
        throw new Error("Error en la petición");
      }

      const datos = await peticion.json();
      console.log("Citas recibidas:", datos);

      setCitas(datos.body || []);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setError("No se pudieron obtener las citas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allCitas();
  }, []); // Solo se ejecuta al montar el componente

  // Función para eliminar cita
  const eliminarCita = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const response = await fetch(`http://localhost:3000/citas/id/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la cita');
        }

        alert('Cita eliminada correctamente');
        allCitas(); // Recargar las citas
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la cita');
      }
    }
  };

  // Función para actualizar cita
  const actualizarCita = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        fecha: formularioRef.current['fecha'].value,
        usuario_id: citaSeleccionada.usuario_id,
        animal_id: citaSeleccionada.animal_id,
        nombre_usuario: citaSeleccionada.nombre_usuario,
        nombre_animal: citaSeleccionada.nombre_animal
      };

      const response = await fetch(`http://localhost:3000/citas/id/${citaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cita');
      }

      alert('Cita actualizada correctamente');
      setShowModal(false);
      allCitas(); // Recargar las citas
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la cita');
    }
  };

  return (
    <>
      <Container className="mt-4">
        <Row>
          <Col>
            <h1 className="text-center">Citas</h1>
          </Col>
        </Row>
        <Row>
          {citas?.map((cita) => (
            <Col key={cita.id} md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title className="text-primary">
                    <i className="bi bi-person-fill me-2"></i>
                    {cita.nombre_usuario}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-success">
                    <i className="bi bi-heart-fill me-2"></i>
                    {cita.nombre_animal}
                  </Card.Subtitle>
                  <Card.Text>
                    <i className="bi bi-calendar-event me-2"></i>
                    {new Date(cita.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-3">
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        setCitaSeleccionada(cita);
                        setShowModal(true);
                      }}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Actualizar
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => eliminarCita(cita.id)}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Modal de actualización */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form ref={formularioRef} onSubmit={actualizarCita}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                defaultValue={citaSeleccionada?.fecha?.split('T')[0]}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={citaSeleccionada?.nombre_usuario || ''}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Animal</Form.Label>
              <Form.Control
                type="text"
                value={citaSeleccionada?.nombre_animal || ''}
                disabled
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar cambios
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminCitas;
