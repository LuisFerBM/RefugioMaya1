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

const AdminVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const formularioRef = useRef(null);
  const [voluntarioEditar, setVoluntarioEditar] = useState(null);
  const [animales, setAnimales] = useState([]); // Añadir este estado

  // Obtener todos los voluntarios
  const AllVoluntarios = async () => {
    try {
      const peticion = await fetch("http://localhost:3000/voluntarios");
      if (!peticion.ok) throw new Error("Error en la petición");
      const datos = await peticion.json();
      setVoluntarios(datos.body || []);
    } catch (error) {
      console.error("Error al obtener voluntarios:", error);
      setError("No se pudieron obtener los voluntarios.");
    } finally {
      setLoading(false);
    }
  };

  // Añadir función para obtener animales
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

  // Eliminar voluntario
  const eliminarVoluntario = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este voluntario?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/voluntarios/id/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert("Voluntario eliminado con éxito");
          AllVoluntarios();
          window.location.reload(); // Recargar la página
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar el voluntario");
      }
    }
  };

  // Actualizar voluntario
  const actualizarVoluntario = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: formularioRef.current["nombre"].value,
        email: formularioRef.current["email"].value,
        telefono: formularioRef.current["telefono"].value,
        id_animal: Number(formularioRef.current["id_animal"].value), // Asegurar que sea número
      };

      console.log("Datos a actualizar:", formData); // Debug

      const response = await fetch(
        `http://localhost:3000/voluntarios/id/${voluntarioEditar.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar");
      }

      const data = await response.json();
      console.log("Respuesta:", data); // Debug

      setVoluntarios((prevVoluntarios) =>
        prevVoluntarios.map((v) =>
          v.id === voluntarioEditar.id ? { ...v, ...formData } : v
        )
      );

      setShowModal(false);
      alert("Voluntario actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error al actualizar el voluntario");
    }
  };

  useEffect(() => {
    AllVoluntarios();
    getAllAnimales(); // Llamar a la función cuando el componente se monte
  }, []);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Voluntarios</h2>
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
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th> <th>id_animal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {voluntarios.map((voluntario) => (
                  <tr key={voluntario.id}>
                    <td>{voluntario.id}</td>
                    <td>{voluntario.nombre}</td>
                    <td>{voluntario.email}</td>
                    <td>{voluntario.telefono}</td>
                    <td>
                      {animales.find((a) => a.id === voluntario.id_animal)
                        ?.nombre || `Sin animal asignado`}{" "}
                      (ID: {voluntario.id_animal})
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setVoluntarioEditar(voluntario);
                          setShowModal(true);
                        }}>
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarVoluntario(voluntario.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Voluntario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={actualizarVoluntario} ref={formularioRef}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                defaultValue={voluntarioEditar?.nombre}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                defaultValue={voluntarioEditar?.email}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                defaultValue={voluntarioEditar?.telefono}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Animal Asignado</Form.Label>
              <Form.Select
                name="id_animal"
                value={voluntarioEditar?.id_animal || ""}
                onChange={(e) => {
                  setVoluntarioEditar({
                    ...voluntarioEditar,
                    id_animal: Number(e.target.value),
                  });
                }}
                required>
                <option value="">Seleccione un animal</option>
                {animales.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nombre} (ID: {animal.id})
                  </option>
                ))}
              </Form.Select>
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

export default AdminVoluntarios;
