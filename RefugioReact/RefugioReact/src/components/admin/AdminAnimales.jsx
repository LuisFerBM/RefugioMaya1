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

      alert("Animal creado correctamente");
      formularioRef.current.reset();
      setValidated(false);
    } catch (error) {
      console.error("Error al crear animal:", error);
      setError(error.message);
    }
  };

  // Añade esta función para eliminar animal
  const eliminarAnimal = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este animal?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/animales/id/${id}`,
          {
            method: "DELETE",
          }
        );

        const datos = await response.json();

        if (!response.ok) {
          throw new Error(datos.body || "Error al eliminar animal");
        }

        alert("Animal eliminado correctamente");
        cargarAnimales(); // Recargar la lista
      } catch (error) {
        console.error("Error al eliminar animal:", error);
        setError(error.message);
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
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="text-center p-3">
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
          Actualizar Animal
        </Button>
      </Form>
    </Container>
  );
};

export default AdminAnimales;
