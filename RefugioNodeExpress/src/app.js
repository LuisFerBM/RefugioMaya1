const express = require('express');
const cors = require('cors');
const config = require('./config');
const animalesRouter = require('./modulos/animales/rutas');
const usuariosRouter = require('./modulos/usuarios/rutas');
const loginRouter = require('./modulos/usuarios/rutas');
const voluntariosRouter = require('./modulos/voluntarios/rutas');
const citasRouter = require('./modulos/citas/rutas');

const app = express();

// Configurar CORS
app.use(cors({
    origin: 'http://localhost:5173' // URL del cliente React
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Configuración
app.set('port', config.app.port);

// Rutas base
app.use('/animales', animalesRouter);
app.use('/animales/id/:id', animalesRouter);        // GET animal por ID
app.use('/animales/add', animalesRouter);               // POST nuevo animal
app.use('/animales/id/:id', animalesRouter);               // PUT actualizar animal
app.use('/animales/id/:id', animalesRouter);               // DELETE eliminar animal

// Rutas de usuarios con autenticación
app.use('/usuarios', usuariosRouter);              // GET, PUT, DELETE usuarios
app.use('/registro', usuariosRouter);              // POST registro
app.use('/login', loginRouter);                 // POST login
app.use('/id/:id', usuariosRouter);                 // PUT actualizar usuario
app.use('/id/:id', usuariosRouter);                 // DELETE eliminar usuario



// Rutas de voluntarios
app.use('/voluntarios', voluntariosRouter);                 // get 
app.use('/unirse', voluntariosRouter);                      // POST registro voluntario
app.use('/id/:id', voluntariosRouter);                       // PUT actualizar voluntario
app.use('/id/:id', voluntariosRouter);                       // DELETE eliminar voluntario

app.use('/citas', citasRouter);                 // get                     // POST registro  
app.use('/id/:id', citasRouter);                       // PUT actualizar  
app.use('/id/:id', citasRouter); 
app.use('/id/:id', citasRouter);  
app.use('/id/:id', citasRouter);                     // DELETE eliminar  



// Error 404
app.use((req, res) => {
    console.log('Ruta no encontrada:', req.path);
    res.status(404).json({
        error: true,
        message: 'Ruta no encontrada'
    });
});

module.exports = app;