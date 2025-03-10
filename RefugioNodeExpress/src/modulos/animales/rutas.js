const express = require("express");
const respuesta = require("../../red/respuesta");
const { animales } = require("../controlador");
const router = express.Router();

// GET todos los animales
router.get("/", async (req, res) => {
  try {
    const items = await animales.All();
    respuesta.success(req, res, items, 200);  // Usar helper de respuesta
  } catch (error) {
    respuesta.error(req, res, "Error al obtener animales", 500, error);
  }
});

// GET animal por ID
router.get("/id/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Buscando animal con ID:", id);

    if (!id || isNaN(id)) {
      return respuesta.error(req, res, "ID_animal no válido", 400);
    }

    const item = await animales.One(id);

    if (!item) {
      return respuesta.error(req, res, "Animal no encontrado", 404);
    }

    respuesta.success(req, res, item, 200);
  } catch (error) {
    console.error("Error en consulta:", error);
    respuesta.error(req, res, "Error al obtener animal", 500, error);
  }
});


// POST nuevo animal
router.post("/add", async (req, res) => {
  try {
    const { nombre, edad, id_especie, estado_adopcion, imagenes } = req.body;

    if (!nombre || !edad || !id_especie) {
      return respuesta.error(req, res, "Faltan datos requeridos", 400);
    }

    const nuevoAnimal = {
      nombre,
      edad,
      id_especie,
      estado_adopcion: estado_adopcion || "disponible",
      imagenes
      
    };

    const animalCreado = await animales.Add(nuevoAnimal);
    respuesta.success(req, res, animalCreado, 201);
  } catch (error) {
    console.error("Error al crear animal:", error);
    respuesta.error(req, res, "Error al crear animal", 500, error);
  }
});

// DELETE animal por ID con eliminación en cascada
router.delete("/id/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Eliminando animal con ID:", id);

    if (!id || isNaN(id)) {
      return respuesta.error(req, res, "ID no válido", 400);
    }

    // Primero verificar si existe el animal
    const animal = await animales.One(id);
    if (!animal) {
      return respuesta.error(req, res, "Animal no encontrado", 404);
    }

    // Eliminar primero los estados asociados (si existen)
    try {
      await db.query('DELETE FROM estado WHERE id_animal = ?', [id]);
      console.log('Estados eliminados para el animal:', id);
    } catch (estadoError) {
      console.log('No se encontraron estados para eliminar:', estadoError);
    }

    // Ahora sí eliminar el animal
    await animales.Delete(id);

    respuesta.success(
      req,
      res,
      { mensaje: "Animal y sus estados eliminados correctamente" },
      200
    );
  } catch (error) {
    console.error("Error al eliminar:", error);
    respuesta.error(req, res, "Error al eliminar animal", 500, error);
  }
});

router.put("/id/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, edad, id_especie, estado_adopcion } = req.body;

    console.log("Actualizando animal ID:", id);

    if (!id || isNaN(id)) {
      return respuesta.error(req, res, "ID_animal no válido", 400);
    }

    const datosActualizados = {
      ...(nombre && { nombre }),
      ...(edad && { edad }),
      ...(id_especie && { id_especie }),
      ...(estado_adopcion && { estado_adopcion }),
    };

    const animalActualizado = await animales.Update(
      id,
      datosActualizados
    );
    respuesta.success(req, res, animalActualizado, 200);
  } catch (error) {
    console.error("Error al actualizar:", error);
    respuesta.error(req, res, "Error al actualizar animal", 500, error);
  }
});
module.exports = router;
