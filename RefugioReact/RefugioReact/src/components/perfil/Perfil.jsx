import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const Perfil = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]); // Agregar este estado
  const [animales, setAnimales] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const formularioRef = useRef();

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (user) {
      allCitas();
    }
  }, [user]);

  const AllUsuarios = async () => {
    try {
      const peticion = await fetch(`http://localhost:3000/usuarios`);

      if (!peticion.ok) {
        throw new Error("Error en la petición");
      }

      const datos = await peticion.json();
      console.log("Usuarios recibidos:", datos);

      if (datos && datos.body) {
        setUsuarios(datos.body);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError("No se pudieron obtener usuarios.");
      setUsuarios([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) { // Solo cargar si hay un usuario logueado
      AllUsuarios();
    }
  }, [user]);

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: formularioRef.current["nombre"].value,
        email: formularioRef.current["email"].value,
      };

      const response = await fetch(
        `http://localhost:3000/usuarios/id/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el perfil");
      }

      // Actualizar el estado local con los nuevos datos
      const updatedUser = {
        ...user,
        nombre: formData.nombre,
        email: formData.email,
      };

      // Actualizar el estado y localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditMode(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error al actualizar el perfil");
    }
  };

  const allCitas = async () => {
    try {
      if (!user || !user.id) {
        console.log("No hay usuario logueado o falta ID");
        setCitas([]);
        setLoading(false);
        return;
      }
  
      console.log("Obteniendo citas para usuario:", user.id);
      
      const peticion = await fetch(`http://localhost:3000/citas/usuario/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const datos = await peticion.json();
      console.log("Datos recibidos del servidor:", datos);
  
      if (!peticion.ok) {
        throw new Error(datos.message || "No se pudieron obtener las citas");
      }
  
      // Asegurarse de que datos.body sea un array
      const citasArray = Array.isArray(datos.body) ? datos.body : [];
      console.log("Citas procesadas:", citasArray);
      
      setCitas(citasArray);
  
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setError(error.message);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Modificar el useEffect para las citas
  useEffect(() => {
    const fetchCitas = async () => {
      if (user?.id) {
        setLoading(true);
        await allCitas();
      }
    };
    
    fetchCitas();
  }, [user]);

  const eliminarCita = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        const response = await fetch(`http://localhost:3000/citas/id/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar la cita");
        }

        alert("Cita eliminada correctamente");
        allCitas(); // Recargar las citas
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar la cita");
      }
    }
  };

  return (
    <>
      <Container fluid className="mb-4">
        <Row className="justify-content-between align-items-center">
          <Col>
            <Button as={Link} to="/home" variant="primary" className="m-2">
              Volver al Menú
            </Button>
          </Col>
          {user && (
            <Col className="text-end">
              <span className="user-welcome primary-text">
                Bienvenido, {user.nombre}
              </span>
            </Col>
          )}
        </Row>
      </Container>

      <Container className="mt-4">
        {/* Perfil siempre visible */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Mi Perfil</h2>
              <Button
                variant={editMode ? "secondary" : "primary"}
                onClick={() => setEditMode(!editMode)}>
                {editMode ? "Cancelar" : "Editar Perfil"}
              </Button>
            </div>

            {editMode ? (
              <Form ref={formularioRef} onSubmit={actualizarPerfil}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    defaultValue={user?.nombre}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    defaultValue={user?.email}
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit">
                  Guardar Cambios
                </Button>
              </Form>
            ) : (
              <div>
                <p>
                  <strong>Nombre:</strong> {user?.nombre}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Sección de citas con manejo de estados */}
        <h2 className="text-center mb-4">Mis Citas</h2>

        {loading ? (
          <div className="text-center p-5">
            <h3>Cargando citas...</h3>
          </div>
        ) : error ? (
          <div className="text-center p-5">
            <h3 className="text-danger">{error}</h3>
          </div>
        ) : citas.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <h3 className="text-muted mb-4">No tienes citas agendadas</h3>
              <p className="text-muted">Usuario ID: {user?.id}</p>
              <Button as={Link} to="/animales" variant="primary" size="lg">
                ¡Agenda tu primera cita!
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {citas.map((cita) => (
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
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Estás seguro de que deseas eliminar esta cita?"
                          )
                        ) {
                          eliminarCita(cita.id);
                        }
                      }}>
                      <i className="bi bi-trash me-2"></i>
                      Eliminar Cita
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Perfil;
