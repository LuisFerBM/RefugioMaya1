import React, { useState, useEffect, useRef } from "react";
import { Card, Row, Col, Container, ButtonGroup, Button, CardBody } from "react-bootstrap";
import { NavLink, Link } from "react-router-dom";
import "./Animales.css";
import video from "../../assets/video/video.mp4"; // Corregida la ruta



const Animales = () => {
  const [animales, setAnimales] = useState([]); // Cambiado de null a array vacío  const [filtro, setFiltro] = useState('todos'); // 'todos', 'adoptado', 'disponible'
const [citas, setCitas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);   
  const formularioRef = useRef();
  const formRef = useRef(null);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // Añadido el estado filtro

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

  const animalesFiltrados = () => {
    if (!animales) return [];
    switch (filtro) {
      case 'adoptado':
        return animales.filter(animal => animal.estado_adopcion === 'adoptado');
      case 'disponible':
        return animales.filter(animal => animal.estado_adopcion !== 'adoptado');
      default:
        return animales;
    }
  };

  const handleCardClick = (animal) => {
    if (animal.estado_adopcion !== "adoptado") {
      setAnimalSeleccionado(animal.id);
      // Scroll suave al formulario
      formularioRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

 // Actualizar la función addCita
const addCita = async (e) => {
  e.preventDefault();

  try {
    if (!user) {
      setError("Debe iniciar sesión para agendar una cita");
      return;
    }

    if (!animalSeleccionado) {
      setError("Debe seleccionar un animal");
      return;
    }

    const fecha = formularioRef.current["fecha"].value;
    if (!fecha) {
      setError("Debe seleccionar una fecha");
      return;
    }

    // Encontrar el animal seleccionado
    const animalElegido = animales.find(a => a.id === parseInt(animalSeleccionado));
    if (!animalElegido) {
      setError("Animal no encontrado");
      return;
    }

    const nuevaCita = {
      usuario_id: parseInt(user.id),
      animal_id: parseInt(animalSeleccionado),
      fecha: fecha,
      nombre_usuario: user.nombre, // Aseguramos que se envía el nombre del usuario
      nombre_animal: animalElegido.nombre // Aseguramos que se envía el nombre del animal
    };

    console.log("Enviando cita:", nuevaCita);

    const response = await fetch("http://localhost:3000/citas/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaCita)
    });

    const datos = await response.json();

    if (!response.ok) {
      throw new Error(datos.body || "Error al crear la cita");
    }

    alert("Cita agendada correctamente");
    formularioRef.current.reset();
    setAnimalSeleccionado("");

    if (typeof allCitas === 'function') {
      allCitas();
    }

  } catch (error) {
    console.error("Error al crear cita:", error);
    setError(error.message);
    alert("Error al crear la cita: " + error.message);
  }
};
  const videoRef = useRef(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <div className="video-container">
        <video ref={videoRef} className="video_background" autoPlay loop muted>
          <source src={video} type="video/mp4" />
        </video>
      </div>
      
      <div className="content-wrapper">
        {/* Barra de navegación */}
        <Container fluid className="mb-4">
          <Row className="justify-content-between align-items-center">
            <Col>
              <Button 
                as={Link} 
                to="/home" 
                variant="outline-light"
                className="m-2"
              >
                Volver al Menú
              </Button>
            </Col>
            {user && (
              <Col className="text-end">
                <span className="user-welcome">
                  Bienvenido, {user.nombre}
                </span>
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
                variant={filtro === 'todos' ? 'primary' : 'outline-primary'}
                onClick={() => setFiltro('todos')}
              >
                Todos
              </Button>
              <Button 
                variant={filtro === 'disponible' ? 'primary' : 'outline-primary'}
                onClick={() => setFiltro('disponible')}
              >
                Disponibles
              </Button>
              <Button 
                variant={filtro === 'adoptado' ? 'primary' : 'outline-primary'}
                onClick={() => setFiltro('adoptado')}
              >
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
                    bg={animal.estado_adopcion === "adoptado" ? "secondary" : "info"} 
                    style={{ 
                      borderWidth: '3px',
                      cursor: animal.estado_adopcion !== "adoptado" ? 'pointer' : 'default'
                    }}
                    onClick={() => handleCardClick(animal)}
                  >
                    {animal.imagen ? (
                      <Card.Img
                        variant="top"
                        src={animal.imagen}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'  // Cambiado de 'contain' a 'cover'
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <h3 className="text-muted fs-6">Sin imagen</h3>
                      </div>
                    )}
                    <Card.Body   >
                      <Card.Title className="h6 text-truncate">{animal.nombre}</Card.Title>
                      <Card.Text as="div" className="small">
                        <div className="mb-1 text-truncate">Edad: {animal.edad} años</div>
                        <div className="mb-1 text-truncate">Especie: {animal.id_especie}</div>
                        <div className="mb-1 text-truncate">Estado: {animal.estado_adopcion}</div>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>

        {/* Contenedor de citas */}
        <Container className="citas-container">
          <Row className="mt-4">
            <Col md={6} className="mx-auto">
              <Card>
                <Card.Body>
                  <Card.Title>Nueva Cita</Card.Title>
                  <form 
                    ref={formularioRef} 
                    onSubmit={addCita} 
                    className="scroll-margin-top"
                  >
                    <div className="mb-3">
                      <label className="form-label">Usuario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.nombre || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Animal</label>
                      <select 
                        name="animal_id" 
                        className="form-control" 
                        required
                        value={animalSeleccionado || ""}
                        onChange={(e) => setAnimalSeleccionado(e.target.value)}
                      >
                        <option value="">Seleccione un animal</option>
                        {animales?.map((animal) => (  // Añadido el operador opcional ?
                          <option 
                            key={animal.id} 
                            value={animal.id}
                            disabled={animal.estado_adopcion === "adoptado"}
                          >
                            {animal.nombre} {animal.estado_adopcion === "adoptado" ? "(Adoptado)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Fecha</label>
                      <input
                        name="fecha"
                        type="date"
                        className="form-control"
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary">
                      Agendar Cita
                    </Button>
                  </form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>
      </div>
      <Button
  className="scroll-to-top"
  onClick={() => {
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }}
  aria-label="Volver al inicio"
>
  ↑
</Button>
 
    </>
  );
};

export default Animales;
