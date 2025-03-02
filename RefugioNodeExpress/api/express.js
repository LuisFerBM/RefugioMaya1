// api/express.js
const express = require('express');
const cors = require('cors');

const app = express();

// Configurar CORS
app.use(cors({
  origin: '*', // Cambia esto por el dominio real si es necesario
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('API funcionando correctamente');
});

// Exportar como función serverless para Vercel
module.exports = (req, res) => {
  app(req, res);  // Ejecutamos el servidor Express en la función serverless
};
