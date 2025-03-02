const express = require("express");
const bcrypt = require('bcrypt');
const respuesta = require("../../red/respuesta");
const { usuarios } = require("../controlador");
const router = express.Router();

 
// GET todos los usuarios
router.get("/", async (req, res) => {
    try {
        const items = await usuarios.All();
        respuesta.success(req, res, items, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al obtener usuarios", 500, error);
    }
});

// POST registro usuario
router.post("/registro", async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return respuesta.error(req, res, "Faltan datos requeridos", 400);
        }

        // Verificar si ya existe un usuario con ese email
        const usuarioExistente = await usuarios.FindByEmail(email);
        if (usuarioExistente) {
            return respuesta.error(req, res, "El email ya está registrado", 400);
        }

        // Hash contraseña
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = {
            nombre,
            email,
            password_hash
        };

        const usuarioCreado = await usuarios.Add(nuevoUsuario);
        const { password_hash: hash, ...usuarioSinHash } = usuarioCreado;
        respuesta.success(req, res, usuarioSinHash, 201);
    } catch (error) {
        console.error('Error en registro:', error);
        respuesta.error(req, res, "Error al crear usuario", 500, error);
    }
});

//   login
 // POST login usuario
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validación de campos
    if (!email || !password) {
      return respuesta.error(req, res, "Faltan datos requeridos", 400);
    }

    // Intentar obtener el usuario
    const usuario = await usuarios.Login(email);
    console.log('Usuario encontrado:', usuario); // Para debugging

    // Verificar si el usuario existe
    if (!usuario) {
      return respuesta.error(req, res, "Usuario no encontrado", 404);
    }

    // Verificar si existe password_hash
    if (!usuario.password_hash) {
      return respuesta.error(req, res, "Error en los datos del usuario", 500);
    }

    // Comparar contraseñas
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    
    if (passwordValida) {
      const { password_hash, ...usuarioSinHash } = usuario;
      return respuesta.success(req, res, usuarioSinHash, 200);
    } else {
      return respuesta.error(req, res, "Contraseña incorrecta", 401);
    }

  } catch (error) {
    console.error('Error en login:', error); // Para debugging
    return respuesta.error(req, res, "Error al iniciar sesión", 500, error);
  }
});
router.get("/login", (req, res) => {
    respuesta.error(req, res, "Método no permitido", 405);
});
// PUT actualizar usuario
router.put("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, email, password } = req.body;

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID de usuario no válido", 400);
        }

        const datosActualizados = {
            ...(nombre && { nombre }),
            ...(email && { email }),
           
        };

        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            datosActualizados.password_hash = password_hash;
        }

        const usuarioActualizado = await usuarios.Update(id, datosActualizados);
        const { password_hash, ...usuarioSinHash } = usuarioActualizado;
        respuesta.success(req, res, usuarioSinHash, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al actualizar usuario", 500, error);
    }
});

// DELETE eliminar usuario
router.delete("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID de usuario no válido", 400);
        }

        await usuarios.Delete(id);
        respuesta.success(req, res, { mensaje: "Usuario eliminado correctamente" }, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al eliminar usuario", 500, error);
    }
});

module.exports = router;
