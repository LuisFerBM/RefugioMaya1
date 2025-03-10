const app = require('./app');
const express = require('express');
const cors = require('cors');

// Configuración de CORS
app.use(cors({
    origin: '*',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para JSON
app.use(express.json());

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Inicio el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Para Vercel
module.exports = app;



