import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Form } from "react-bootstrap";

const Estado = () => {
    const [animales, setAnimales] = useState([]);
    const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
    const [estado, setEstado] = useState(null);

    // Obtener todos los animales
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

    // Obtener el estado de un animal específico
    const obtenerEstado = async (idAnimal) => {
        try {
            const response = await fetch(`http://localhost:3000/estado/id/${idAnimal}`);
            if (!response.ok) {
                throw new Error("Error al obtener el estado");
            }
            const data = await response.json();
            if (data.body) {
                setEstado({
                    ...data.body,
                });
            } else {
                setEstado(null);
                alert("Este animal no tiene estado registrado");
            }
        } catch (error) {
            console.error("Error:", error);
            setEstado(null);
            alert("Error al obtener el estado del animal");
        }
    };

    useEffect(() => {
        allAnimales();
    }, []);

    const handleAnimalSelect = (e) => {
        const idAnimal = e.target.value;
        setAnimalSeleccionado(idAnimal);
        if (idAnimal) {
            obtenerEstado(idAnimal);
        } else {
            setEstado(null);
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h3>Estado de los Animales</h3>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Selecciona un animal:</Form.Label>
                                <Form.Select 
                                    onChange={handleAnimalSelect}
                                    value={animalSeleccionado || ''}
                                >
                                    <option value="">Selecciona un animal</option>
                                    {animales.map((animal) => (
                                        <option key={animal.id} value={animal.id}>
                                            {animal.nombre} - {animal.id_especie === 1 ? 'Perro' : 'Gato'}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {estado ? (
                                <Card className="mt-3">
                                    <Card.Body>
                                        <h4>Estado del Animal</h4>
                                        <p><strong>Salud:</strong> {estado.salud || 'No registrada'}</p>
                                        <p><strong>Comportamiento:</strong> {estado.comportamiento || 'No registrado'}</p>
                                        <p><strong>Alimentación:</strong> {estado.alimentacion || 'No registrada'}</p>
                                        <p><strong>Ubicación:</strong> {estado.ubicacion || 'No registrada'}</p>
                                        <p><strong>Última actualización:</strong> {estado.fecha}</p>
                                        
                                        <div className="mt-3">
                                            <button 
                                                className="btn btn-primary me-2" 
                                                onClick={() => actualizarEstado(animalSeleccionado)}
                                            >
                                                Actualizar Estado
                                            </button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ) : animalSeleccionado && (
                                <div className="alert alert-info mt-3">
                                    Este animal no tiene
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Estado;