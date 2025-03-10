const express = require("express");
const respuesta = require("../../red/respuesta");
const { estado } = require("../controlador");

const router = express.Router();

// GET todos los estados
router.get("/", async (req, res) => {
    try {
        const items = await estado.All();
        respuesta.success(req, res, items, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al obtener estados", 500, error);
    }
});

// GET estado por ID
router.get("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Buscando estado con ID:", id);

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID no válido", 400);
        }

        const item = await estado.One(id);
        
        if (!item) {
            return respuesta.error(req, res, "Estado no encontrado", 404);
        }

        respuesta.success(req, res, item, 200);
    } catch (error) {
        console.error("Error en consulta:", error);
        respuesta.error(req, res, "Error al obtener estado", 500, error);
    }
});

// GET estado por ID de animal
router.get("/animal/:id", async (req, res) => {
    try {
        const idAnimal = req.params.id;
        console.log("Buscando estado para el animal con ID:", idAnimal);

        if (!idAnimal || isNaN(idAnimal)) {
            return respuesta.error(req, res, "ID de animal inválido", 400);
        }

        const item = await estado.OneByAnimal(idAnimal);
        
        if (!item) {
            return respuesta.error(req, res, "Estado no encontrado para este animal", 404);
        }

        respuesta.success(req, res, item, 200);
    } catch (error) {
        console.error("Error en consulta estado/animal:", error);
        respuesta.error(req, res, "Error al obtener estado", 500, error);
    }
});

// POST nuevo estado - Simplificar la ruta
router.post("/", async (req, res) => {
    try {
        const { id_animal, salud, comportamiento, alimentacion } = req.body;

        if (!id_animal || !salud || !comportamiento || !alimentacion) {
            return respuesta.error(req, res, "Faltan datos requeridos", 400);
        }

        const nuevoEstado = {
            id_animal,
            salud,
            comportamiento,
            alimentacion
        };

        console.log("Creando nuevo estado:", nuevoEstado);

        const estadoCreado = await estado.Add(nuevoEstado);
        respuesta.success(req, res, estadoCreado, 201);
    } catch (error) {
        console.error("Error al crear estado:", error);
        respuesta.error(req, res, "Error al crear estado", 500, error);
    }
});

// DELETE estado por ID
router.delete("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Eliminando estado con ID:", id);

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID no válido", 400);
        }

        await estado.Delete(id);
        respuesta.success(req, res, { mensaje: "Estado eliminado correctamente" }, 200);
    } catch (error) {
        console.error("Error al eliminar:", error);
        respuesta.error(req, res, "Error al eliminar estado", 500, error);
    }
});

// PUT actualizar estado - Mejorar validación
router.put("/id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("ID recibido en el backend:", id);
        console.log("Datos recibidos en el backend:", req.body);
        
        const { id_animal, salud, comportamiento, alimentacion, ubicacion } = req.body;

        console.log("Actualizando estado ID:", id, "con datos:", req.body);

        if (!id || isNaN(id)) {
            return respuesta.error(req, res, "ID no válido", 400);
        }

        // Validar que al menos un campo se está actualizando
        if (!id_animal && !salud && !comportamiento && !alimentacion && !ubicacion) {
            return respuesta.error(req, res, "No hay datos para actualizar", 400);
        }

        const datosActualizados = {
            ...(id_animal && { id_animal }),
            ...(salud && { salud }),
            ...(comportamiento && { comportamiento }),
            ...(alimentacion && { alimentacion }),
            ...(ubicacion && { ubicacion })
        };

        const estadoActualizado = await estado.Update(id, datosActualizados);
        
        if (!estadoActualizado) {
            return respuesta.error(req, res, "Estado no encontrado", 404);
        }

        respuesta.success(req, res, estadoActualizado, 200);
    } catch (error) {
        console.error("Error detallado en el backend:", error);
        respuesta.error(req, res, "Error al actualizar estado", 500, error);
    }
});

module.exports = router;
