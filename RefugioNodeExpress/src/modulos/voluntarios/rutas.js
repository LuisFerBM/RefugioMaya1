const express = require("express");
const respuesta = require("../../red/respuesta");
const { voluntarios } = require("../controlador");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const items = await voluntarios.All();
        respuesta.success(req, res, items, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al obtener voluntarios", 500, error);
    }
});

// POST registro voluntario
router.post("/unirse", async (req, res) => {
    try {
        const { 
            nombre, 
            telefono, 
            email,
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !telefono || !email) {
            return respuesta.error(req, res, "Faltan datos requeridos", 400);
        }

        const nuevoVoluntario = {
            nombre,
            telefono,
            email,
        };

        const voluntarioCreado = await voluntarios.Add(nuevoVoluntario);
        respuesta.success(req, res, voluntarioCreado, 201);
    } catch (error) {
        console.error("Error al registrar voluntario:", error);
        respuesta.error(req, res, "Error al registrar voluntario", 500, error);
    }
});

// PUT actualizar voluntario
router.put("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, telefono, email } = req.body;

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID de voluntario no válido", 400);
        }

        const datosActualizados = {
            ...(nombre && { nombre }),
            ...(telefono && { telefono }),
            ...(email && { email })
        };

        const voluntarioActualizado = await voluntarios.Update(id, datosActualizados);
        respuesta.success(req, res, voluntarioActualizado, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al actualizar voluntario", 500, error);
    }
});

// DELETE eliminar voluntario
router.delete("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID de voluntario no válido", 400);
        }

        await voluntarios.Delete(id);
        respuesta.success(req, res, { mensaje: "Voluntario eliminado correctamente" }, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al eliminar voluntario", 500, error);
    }
});

module.exports = router;