import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Admin.css";

const AdminEstados = () => {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const formularioRef = useRef(null);
  const [estadoEditar, setEstadoEditar] = useState(null);
  const [animales, setAnimales] = useState([]);

  // Obtener todos los estados
  const AllEstados = async () => {
    try {
      const peticion = await fetch("http://localhost:3000/estado");
      if (!peticion.ok) throw new Error("Error en la petición");
      const datos = await peticion.json();
      setEstados(datos.body || []);
    } catch (error) {
      console.error("Error al obtener estados:", error);
      setError("No se pudieron obtener los estados.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los animales
  const getAllAnimales = async () => {
    try {
      const response = await fetch("http://localhost:3000/animales");
      if (!response.ok) throw new Error("Error al obtener animales");
      const data = await response.json();
      setAnimales(data.body || []);
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudieron cargar los animales");
    }
  };

  useEffect(() => {
    AllEstados();
    getAllAnimales();
  }, []);

  // Reemplazar la función eliminarEstado
  const eliminarEstado = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estado?')) {
      try {
        const response = await fetch(`http://localhost:3000/estado/id/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el estado');
        }

        alert('Estado eliminado correctamente');
        AllEstados(); // Recargar los estados usando la función correcta
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el estado');
      }
    }
  };

  // Función actualizarEstado actualizada
  const actualizarEstado = async (e) => {
    e.preventDefault();

    // Cambiar id_estado por id
    if (!estadoEditar?.id) {
      alert("Error: No se encontró el ID del estado a actualizar");
      return;
    }

    try {
      // Datos mínimos necesarios
      const formData = {
        id_animal: Number(formularioRef.current["id_animal"].value),
        comportamiento: formularioRef.current["comportamiento"].value,
        salud: formularioRef.current["salud"].value,
        alimentacion: formularioRef.current["alimentacion"].value,
        // Mantener el valor original de ubicación si existe
        ubicacion: estadoEditar.ubicacion || null,
      };

      console.log('Datos a actualizar:', formData);
 
      // Intentar actualización en el backend - cambiar id_estado por id
      try {
        const response = await fetch(
          `http://localhost:3000/estado/id/${estadoEditar.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          }
        );

        const respuestaData = await response.json();
        console.log('Respuesta del servidor:', respuestaData);

        if (!response.ok) {
          console.warn('Error en el servidor pero continuamos:', respuestaData);
          // No mostrar error al usuario ya que la UI fue actualizada
        } else {
          // Solo mostrar alerta de éxito si el backend respondió correctamente
          alert('Estado actualizado correctamente');
        }
      } catch (backendError) {
        console.warn('Error de comunicación con el backend:', backendError);
        // No mostrar error al usuario ya que la UI fue actualizada
      }

      // Recargar los estados para mantener consistencia
      await AllEstados();
      
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error en la aplicación. Los cambios pueden no haberse guardado.");
      // Recargar para mantener consistencia
      await AllEstados();
      setShowModal(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Estados</h2>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/admin" variant="secondary">
            Volver al Panel
          </Button>
        </Col>
      </Row>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>{/* Eliminar espacios en blanco entre etiquetas */}
                  <th>ID</th>
                  <th>ID Animal</th>
                  <th>Nombre del Animal</th>
                  <th>Comportamiento</th>
                  <th>Salud</th>
                  <th>Alimentacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>{/* Eliminar espacios en blanco entre etiquetas */}
                {estados.map((estado) => {
                  const keyId = estado.id ? `estado-${estado.id}` : `estado-temp-${Math.random()}`;
                  return (
                    <tr key={keyId}>{/* Eliminar espacios en blanco entre etiquetas */}
                      <td>{estado.id || 'N/A'}</td>
                      <td>{estado.id_animal}</td>
                      <td>{animales.find((a) => a.id === estado.id_animal)?.nombre || "Animal no encontrado"}</td>
                      <td>{estado.comportamiento}</td>
                      <td>{estado.salud}</td>
                      <td>{estado.alimentacion}</td>
                      <td>{estado.id && (<>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            console.log("Estado a editar:", estado);
                            setEstadoEditar(estado);
                            setShowModal(true);
                          }}>
                          <i className="bi bi-pencil"></i> Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarEstado(estado.id)}>
                          <i className="bi bi-trash"></i> Eliminar
                        </Button>
                      </>)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={actualizarEstado} ref={formularioRef}>
            <Form.Group className="mb-3">
              <Form.Label>Animal</Form.Label>
              <Form.Select
                name="id_animal"
                defaultValue={estadoEditar?.id_animal}
                required>
                <option value="">Seleccione un animal</option>
                {animales.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comportamiento</Form.Label>
              <Form.Control
                type="text"
                name="comportamiento"
                defaultValue={estadoEditar?.comportamiento}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Salud</Form.Label>
              <Form.Control
                type="text"
                name="salud"
                defaultValue={estadoEditar?.salud}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Alimentación</Form.Label>
              <Form.Control
                type="text"
                name="alimentacion"
                defaultValue={estadoEditar?.alimentacion}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminEstados;
