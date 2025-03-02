import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  NavDropdown,
  Carousel,
  Card,
} from "react-bootstrap";
import uno from "../../assets/uno.jpg";
import video from "../../assets/video/video.mp4"; // Corregida la ruta
import "../../App.css"; // Importar estilos de App.css
import "./Home.css"; // Importar estilos de Home.css

const Home = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [animales, setAnimales] = useState([]);
  const [index, setIndex] = useState(0);

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAdmin(userData.rol === "admin");
    } else {
      // Si no hay usuario, aseguramos que los estados estén limpios
      setUser(null);
      setIsAdmin(false);
    }
  }, []); // Solo se ejecuta al montar el componente

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // Ajusta este valor entre 0.1 y 1.0
    }
  }, []);

  useEffect(() => {
    allAnimales();
  }, []); // Solo se ejecuta al montar el componente

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false); // Añadimos esto para actualizar el estado de admin
    navigate("/"); // Redirigimos a la página principal
  };
  const videoRef = useRef(null);

  return (
    <>
      <div className="video-container">
        <video ref={videoRef} className="video_background" autoPlay loop muted>
          <source src={video} type="video/mp4" />
        </video>
      </div>
      
      <div className="content-wrapper">
        {/* Navbar */}
        <Navbar expand="lg" variant="dark" className="navbar">
          <Container fluid>
            <Navbar.Brand href="#home">Refugio MAYA</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">
                  <Button variant="primary">Home</Button>{" "}
                </Nav.Link>
                <Nav.Link href="/animales">
                  <Button variant="primary">Animales</Button>
                </Nav.Link>
                <Nav.Link href="/perfil">
                  <Button variant="primary">Mi perfil</Button>
                </Nav.Link>
                <Nav.Link href="/voluntarios">
                  <Button variant="primary">Voluntarios</Button>
                </Nav.Link>
                {!user && (
                  <>
                    <Nav.Link href="/login">
                      <Button variant="primary">Iniciar Sesión</Button>
                    </Nav.Link>
                    <Nav.Link href="/usuarios/registro">
                      <Button variant="primary">Registro</Button>
                    </Nav.Link>
                  </>
                )}
                {isAdmin && (
                  <Nav.Link href="/admin">
                    <Button variant="primary">Admin</Button>
                  </Nav.Link>
                )}
              </Nav>
              {user && (
                <Nav>
                  <span className="navbar-text me-3 text-light">
                    Bienvenido, {user.nombre}
                  </span>
                  <Button variant="outline-danger" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </Nav>
              )}
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Contenido principal con video de fondo */}
        <div className="main-content">
          <Container fluid className="mt-4 bg-transparent">
            <Row>
              <Col className="p-4">
                <h1 className="text-center text-light fs-1 w-100">
                  Bienvenido a Refugio MAYA
                </h1>
              </Col>
            </Row>
          </Container>

          <Container className="bg-transparent" style={{ marginTop: "40vh" }}>
            {" "}
            <Row className="justify-content-center">
              <Col md={4}>
                <Card className="text-center bg-transparent text-light border-light  border-5 w-100 h-100">
                  <Card.Body>
                    <Card.Title className="text-light">
                      {" "}
                      Bienvenidos a Refugio MAYA, tu protectora de animales.
                      ¡Ayúdanos a darles una segunda oportunidad a miles de
                      animales!
                    </Card.Title>
                    <Card.Text>
                      En Refugio MAYA, trabajamos incansablemente para ofrecer un
                      hogar seguro y amoroso a aquellos animales que más lo
                      necesitan. Nuestra misión es rescatar, cuidar y rehabilitar a
                      animales en situación de abandono, maltrato o desnutrición, y
                      brindarles una nueva oportunidad para ser adoptados por
                      familias responsables que les den una vida plena.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center bg-transparent text-light border-success border-5 w-100 h-100">
                  <Card.Body>
                    <Card.Title>¿Quiénes somos?</Card.Title>
                    <Card.Text>
                      Somos un grupo de voluntarios, veterinarios y amantes de los
                      animales comprometidos con el bienestar de nuestros amigos
                      peludos. Desde 2025, hemos estado luchando por
                      el bienestar de los animales, ofreciendo cuidado, atención
                      médica y un refugio donde cada uno de ellos pueda sentirse
                      seguro.{" "}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center bg-transparent text-light border-warning border-5 w-100 h-100">
                  <Card.Body>
                    <Card.Title> Lo que hacemos</Card.Title>
                    <Card.Text>
                      Rescate y rehabilitación: Salvamos a animales de situaciones
                      de abuso, maltrato y abandono, proporcionándoles atención
                      médica y emocional para su recuperación. Adopción responsable:
                      Ayudamos a que cada uno de nuestros animales encuentre una
                      familia que les ofrezca un hogar para toda la vida. Campañas
                      de concienciación: Trabajamos para educar a la sociedad sobre
                      la importancia de la adopción responsable, el cuidado de los
                      animales y la prevención del abandono. Programas de
                      voluntariado: Invitamos a personas comprometidas con la causa
                      animal a ayudarnos con sus habilidades y conocimientos.{" "}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Nueva sección de adopción sin video de fondo */}
        <section className="adoption-section">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} className="text-center">
                <h2 className="text-light mb-4">Adopta un Amigo</h2>
                <p className="text-light mb-4">
                  Dar un hogar a un animal rescatado es una de las experiencias más gratificantes. 
                  Nuestro proceso de adopción está diseñado para asegurar el mejor resultado tanto 
                  para las familias como para nuestros animales.
                </p>
              </Col>
            </Row>

            <Row className="justify-content-center g-4">
              <Col md={3}>
                <Card className="h-100 bg-transparent text-light border-info">
                  <Card.Body>
                    <Card.Title className="text-info">
                      <i className="bi bi-search me-2"></i>
                      Encuentra
                    </Card.Title>
                    <Card.Text>
                      Explora nuestro catálogo de animales disponibles para adopción y encuentra 
                      tu compañero perfecto.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="h-100 bg-transparent text-light border-info">
                  <Card.Body>
                    <Card.Title className="text-info">
                      <i className="bi bi-calendar-check me-2"></i>
                      Agenda
                    </Card.Title>
                    <Card.Text>
                      Programa una visita para conocer a tu futuro amigo y asegurarte de que 
                      sea la mejor opción para ambos.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="h-100 bg-transparent text-light border-info">
                  <Card.Body>
                    <Card.Title className="text-info">
                      <i className="bi bi-house-heart me-2"></i>
                      Adopta
                    </Card.Title>
                    <Card.Text>
                      Completa el proceso de adopción y dale a un animal la oportunidad 
                      de tener un hogar lleno de amor.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="justify-content-center mt-4">
              <Col md={6} className="text-center">
                <Button 
                  as={Link} 
                  to="/animales" 
                  variant="outline-light" 
                  size="lg" 
                  className="mt-4"
                >
                  Ver Animales Disponibles
                </Button>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="volunteer-section">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} className="text-center">
                <h2 className="text-light mb-4">
                  <i className="bi bi-heart-fill text-danger me-2"></i>
                  Únete a Nuestro Equipo de Voluntarios
                </h2>
                <p className="text-light mb-4">
                  Tu ayuda puede marcar la diferencia en la vida de nuestros animales. 
                  Como voluntario, podrás participar en diferentes actividades y ser parte 
                  de nuestra misión de dar una segunda oportunidad a quienes más lo necesitan.
                </p>
              </Col>
            </Row>

            <Row className="justify-content-center g-4">
              <Col md={4}>
                <Card className="h-100 bg-transparent text-light border-danger">
                  <Card.Body>
                    <Card.Title className="text-danger">
                      <i className="bi bi-hand-thumbs-up me-2"></i>
                      ¿Por qué ser voluntario?
                    </Card.Title>
                    <Card.Text>
                      Ayudarás directamente a animales necesitados
                      Formarás parte de una comunidad comprometida
                      Ganarás experiencia valiosa en el cuidado animal
                      Harás amigos que comparten tu pasión
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="h-100 bg-transparent text-light border-danger">
                  <Card.Body>
                    <Card.Title className="text-danger">
                      <i className="bi bi-clipboard-check me-2"></i>
                      Actividades
                    </Card.Title>
                    <Card.Text>
                      Cuidado y alimentación de animales
                      Paseos y socialización
                      Apoyo en eventos de adopción
                      Tareas administrativas y redes sociales
                      Mantenimiento del refugio
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="justify-content-center mt-5">
              <Col md={6} className="text-center">
                <Button 
                  variant="danger" 
                  size="lg"
                  className="px-5 py-3"
                  href="/voluntarios"
                >
                  <i className="bi bi-person-plus-fill me-2"></i>
                  ¡Quiero ser Voluntario!
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default Home;
