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

const Admin = () => {
  return (
    <Container className="scroll-margin-top">
      <Row>
        <Col>
          {" "}
          <Button as={Link} to="/" variant="secondary" className="me-2">
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Menú Principal
          </Button>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="admin-card">
            <Card.Body>
              <Card.Title>Administrador</Card.Title>
              <Card.Text>
                <Link to="adminAnimales">
                  <Button variant="primary">Animales</Button>
                </Link>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="admin-card">
            <Card.Body>
              <Card.Title>Citas</Card.Title>
              <Card.Text>
                <Link to="adminCitas">
                  <Button variant="primary">Citas</Button>
                </Link>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="admin-card">
            <Card.Body>
              <Card.Title>Usuarios</Card.Title>
              <Card.Text>
                <Link to="adminUsuarios">
                  <Button variant="primary">Usuarios</Button>
                </Link>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>{" "}
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="admin-card">
            <Card.Body>
              <Card.Title>Estados</Card.Title>
              <Card.Text>
                <Link to="adminEstados">
                  <Button variant="primary">Estados</Button>
                </Link>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="admin-card">
            <Card.Body>
              <Card.Title>Voluntarios</Card.Title>
              <Card.Text>
                <Link to="adminVoluntarios">
                  <Button variant="primary">Voluntarios</Button>
                </Link>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin;
