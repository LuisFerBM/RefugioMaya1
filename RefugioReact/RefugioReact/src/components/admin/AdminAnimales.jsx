import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Admin.css";

const AdminAnimales = () => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [animales, setAnimales] = useState([]);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const formularioRef = useRef(null);
  const formularioUpdateRef = useRef(null);

  // Función para cargar todos los animales
  const cargarAnimales = async () => {
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
  // Cargar animales al montar el componente
  useEffect(() => {
    cargarAnimales();
  }, []);

  // Función para seleccionar un animal y cargar sus datos en el formulario de actualización
  const seleccionarAnimal = (animal) => {
    setAnimalSeleccionado(animal);
    if (formularioUpdateRef.current) {
      formularioUpdateRef.current["nombre"].value = animal.nombre;
      formularioUpdateRef.current["edad"].value = animal.edad;
      formularioUpdateRef.current["especie"].value =
        animal.id_especie === 1 ? "Gato" : "Perro";
      formularioUpdateRef.current["estado"].value = animal.estado_adopcion;
    }
  };

  // Función para actualizar animal
  const updateAnimal = async (e) => {
    e.preventDefault();
    if (!animalSeleccionado) return;

    try {
      const nombre = formularioUpdateRef.current["nombre"].value;
      const edad = formularioUpdateRef.current["edad"].value;
      const especie = formularioUpdateRef.current["especie"].value;
      const estado = formularioUpdateRef.current["estado"].value;
      const imageInput = formularioUpdateRef.current["imagenes"];

      // Validaciones
      if (!nombre || !edad || !especie || !estado) {
        setError("Todos los campos son requeridos");
        return;
      }

      const id_especie = especie === "Gato" ? 1 : 2;

      // Manejar imagen
      let imagenes = animalSeleccionado.imagenes; // Mantener la imagen existente si no se sube una nueva
      if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        imagenes = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      const animalActualizado = {
        nombre,
        edad,
        id_especie,
        estado_adopcion: estado,
        imagenes: imagenes || "",
      };

      const response = await fetch(
        `http://localhost:3000/animales/id/${animalSeleccionado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(animalActualizado),
        }
      );

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(datos.body || "Error al actualizar animal");
      }

      alert("Animal actualizado correctamente");
      cargarAnimales(); // Recargar la lista de animales
      setAnimalSeleccionado(null);
    } catch (error) {
      console.error("Error al actualizar animal:", error);
      setError(error.message);
    }
  };

  // Modificar la función addAnimal para crear también un estado por defecto
const addAnimal = async (e) => {
    e.preventDefault();

    try {
      const nombre = formularioRef.current["nombre"].value;
      const edad = formularioRef.current["edad"].value;
      const especie = formularioRef.current["especie"].value;
      const estado = formularioRef.current["estado"].value;
      const imageInput = formularioRef.current["imagenes"];

      // Validaciones
      if (!nombre || !edad || !especie || !estado) {
        setError("Todos los campos son requeridos");
        return;
      }

      // Convertir especie a ID
      const id_especie = especie === "Gato" ? 1 : 2;

      // Manejar imagen - usar un Buffer vacío si no hay imagen
      let imagenes = "";
      if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        imagenes = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      const nuevoAnimal = {
        nombre,
        edad,
        id_especie,
        estado_adopcion: estado,
        imagenes: imagenes || "", // Asegurarnos de que nunca sea null
      };

      // Crear el animal
      const response = await fetch("http://localhost:3000/animales/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoAnimal),
      });

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(datos.body || "Error al crear animal");
      }

      // Añadir estado por defecto para el nuevo animal
      if (datos.body && datos.body.id) {
        const nuevoId = datos.body.id;
        
        // Datos de estado por defecto
        const estadoInicial = {
          id_animal: nuevoId,
          comportamiento: "Por evaluar",
          salud: "Por evaluar",
          alimentacion: "Por definir"
        };

        // Crear el estado
        await fetch("http://localhost:3000/estado", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(estadoInicial),
        });
      }

      alert("Animal creado correctamente con estado inicial");
      formularioRef.current.reset();
      setValidated(false);
      cargarAnimales(); // Recargar la lista para ver el nuevo animal
    } catch (error) {
      console.error("Error al crear animal:", error);
      setError(error.message);
    }
};

  // Reemplazar la función eliminarAnimal actual con esta versión simplificada:
const eliminarAnimal = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este animal?")) {
        try {
            console.log('Eliminando animal:', id);
            
            // Primero intentar eliminar estados relacionados si existen
            try {
                const estadoResponse = await fetch(`http://localhost:3000/estado/id/${id}`);
                const estadoData = await estadoResponse.json();
                
                if (estadoResponse.ok && estadoData.body) {
                    const estadoId = estadoData.body.id_estado;
                    console.log('Encontrado estado:', estadoId, 'para animal:', id);
                    
                    // Eliminar el estado
                    await fetch(`http://localhost:3000/estado/id/${estadoId}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" }
                    });
                }
            } catch (estadoError) {
                console.log('No se encontraron estados para el animal o ya fueron eliminados');
            }
            
            // Ahora eliminar el animal
            const response = await fetch(`http://localhost:3000/animales/id/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            
            // Actualizar la UI inmediatamente para mejor experiencia
            setAnimales(prev => prev.filter(animal => animal.id !== id));
            alert("Animal eliminado correctamente");
            
            // Si hay error, recargar la lista para asegurar consistencia
            if (!response.ok) {
                cargarAnimales();
            }
            
        } catch (error) {
            console.error("Error al eliminar:", error);
            setError("Error al eliminar: " + error.message);
            // Recargar lista en caso de error para asegurar consistencia
            cargarAnimales();
        }
    }
};

  // Añade esta función para scroll suave al formulario
  const scrollToUpdateForm = () => {
    document.querySelector("#updateForm").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <Container>
      <Form
        noValidate
        validated={validated}
        onSubmit={addAnimal}
        ref={formularioRef}
        className="mb-4">
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="nombre">
            <Form.Label>nombre</Form.Label>
            <Form.Control required type="text" placeholder="nombre" />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="edad">
            <Form.Label>edad</Form.Label>
            <Form.Control required type="number" placeholder="edad" />
            <Form.Control.Feedback>especie</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="especie">
            <Form.Label>Especie</Form.Label>
            <Form.Select required>
              <option value="">Seleccione una especie</option>
              <option value="Gato">Gato</option>
              <option value="Perro">Perro</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Por favor seleccione una especie
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="3" controlId="estado">
            <Form.Label>Estado de adopción</Form.Label>
            <Form.Select required>
              <option value="">Seleccione un estado</option>
              <option value="adoptado">Adoptado</option>
              <option value="no adoptado">No adoptado</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Por favor seleccione un estado
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="3" controlId="imagenes">
            <Form.Label>Imagen</Form.Label>
            <Form.Control type="file" accept="image/*" />
            <Form.Text className="text-muted">
              Opcional - Si no se sube imagen se usará una por defecto
            </Form.Text>
          </Form.Group>
        </Row>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Button type="submit" className="mt-3">
          Crear Animal
        </Button>
      </Form>

      {/* Lista de animales */}
      <h3 className="mt-4">Animales Registrados</h3>
      <Row className="mb-4">
        {animales.map((animal) => (
          <Col xs={12} sm={6} md={4} lg={3} key={animal.id} className="mb-3">
            <Card className="h-100">
              {animal.imagen ? (
                <Card.Img
                  variant="top"
                  src={animal.imagen}
                  style={{
                    width: "100%", 
                    height: "300px",     // Altura fija para todas las imágenes
                    objectFit: "cover"   // Mantiene la proporción cortando si es necesario
                  }}
                />
              ) : (
                <div 
                  className="text-center p-3" 
                  style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <h3 className="text-muted fs-6">Sin imagen</h3>
                </div>
              )}
              <Card.Body>
                <Card.Title>{animal.nombre}</Card.Title>
                <Card.Text>
                  Edad: {animal.edad}
                  <br />
                  Especie: {animal.id_especie === 1 ? "Gato" : "Perro"}
                  <br />
                  Estado: {animal.estado_adopcion}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 d-flex justify-content-between">
                <Button
                  variant="primary"
                  onClick={() => {
                    seleccionarAnimal(animal);
                    scrollToUpdateForm();
                  }}>
                  <i className="bi bi-pencil"></i> Actualizar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => eliminarAnimal(animal.id)}>
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Formulario de actualización */}
      <h3>Actualizar Animal</h3>
      <Form
        id="updateForm"
        noValidate
        validated={validated}
        onSubmit={updateAnimal}
        ref={formularioUpdateRef}
        className="mb-4">
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="nombre">
            <Form.Label>nombre</Form.Label>
            <Form.Control required type="text" placeholder="nombre" />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="edad">
            <Form.Label>edad</Form.Label>
            <Form.Control required type="number" placeholder="edad" />
            <Form.Control.Feedback>especie</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="especie">
            <Form.Label>Especie</Form.Label>
            <Form.Select required>
              <option value="">Seleccione una especie</option>
              <option value="Gato">Gato</option>
              <option value="Perro ">Perro </option></Form.Select>
            <Form.Control.Feedback type="invalid">
              Por favor seleccione una especie
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="3" controlId="estado">
            <Form.Label>Estado de adopción</Form.Label>
            <Form.Select required>
              <option value="">Seleccione un estado</option>
              <option value="adoptado">Adoptado</option>
              <option value="no adoptado">No adoptado</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Por favor seleccione un estado
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="3" controlId="imagenes">
            <Form.Label>Imagen</Form.Label>
            <Form.Control type="file" accept="image/*" />
            <Form.Text className="text-muted">
              Opcional - Si no se sube imagen se usará una por defecto
            </Form.Text>
          </Form.Group>
        </Row>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Button type="submit" className="mt-3">
          Actualizar Animal
        </Button>
      </Form>
    </Container>
  );
};

export default AdminAnimales;
