import React, { useEffect, useState, useRef } from "react";
import { Button, Container, Row, Col, Card, Alert, Form, Modal } from "react-bootstrap";
import "./Admin.css";

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const formularioRef = useRef(null);

  const AllUsuarios = async (e) => {
    try {
      const peticion = await fetch(`http://localhost:3000/usuarios`);

      if (!peticion.ok) {
        throw new Error("Error en la petición");
      }

      const datos = await peticion.json();
      console.log("Usuarios recibidos:", datos);

      setUsuarios(datos.body || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError("No se pudieron obtener usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AllUsuarios();
  }, []);

  // Función para eliminar usuario y sus citas
  const eliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? También se eliminarán todas sus citas!!.')) {
      try {
        // Primero eliminamos todas las citas del usuario
        const citasResponse = await fetch(`http://localhost:3000/citas`);
        const citasData = await citasResponse.json();
        const citasUsuario = citasData.body.filter(cita => cita.usuario_id === id);

        // Eliminamos cada cita individualmente
        for (const cita of citasUsuario) {
          const response = await fetch(`http://localhost:3000/citas/id/${cita.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Error al eliminar las citas');
          }
        }

        // Una vez eliminadas las citas, eliminamos el usuario
        const responseUsuario = await fetch(`http://localhost:3000/usuarios/id/${id}`, {
          method: 'DELETE',
        });

        if (!responseUsuario.ok) {
          throw new Error('Error al eliminar el usuario');
        }

        alert('Usuario y sus citas eliminados correctamente');
        AllUsuarios(); // Recargar usuarios
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  // Función para actualizar usuario
  const actualizarUsuario = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: formularioRef.current['nombre'].value,
        email: formularioRef.current['email'].value,
        rol: formularioRef.current['rol'].value
      };

      const response = await fetch(`http://localhost:3000/usuarios/id/${usuarioSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      alert('Usuario actualizado correctamente');
      setShowModal(false);
      AllUsuarios(); // Recargar usuarios
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el usuario');
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        {usuarios?.map((usuario) => (
          <Col key={usuario.id} md={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{usuario.nombre}</Card.Title>
                <Card.Text>
                  Email: {usuario.email}<br/>
                  Rol: {usuario.rol}
                </Card.Text>
                <div className="d-flex justify-content-between mt-3">
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setUsuarioSeleccionado(usuario);
                      setShowModal(true);
                    }}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Editar
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => eliminarUsuario(usuario.id)}
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

      {/* Modal de edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form ref={formularioRef} onSubmit={actualizarUsuario}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                defaultValue={usuarioSeleccionado?.nombre}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                defaultValue={usuarioSeleccionado?.email}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select 
                name="rol"
                defaultValue={usuarioSeleccionado?.rol}
                required
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </Form.Select>
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
    </Container>
  );
};

export default AdminUsuarios;
