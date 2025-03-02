const express = require("express");
const respuesta = require("../../red/respuesta");
const { citas } = require("../controlador");
const router = express.Router();
const db = require("../../DataBase/mysql");

router.get("/", async (req, res) => {
    try {
        const items = await citas.All();
        respuesta.success(req, res, items, 200);
    } catch (error) {
        respuesta.error(req, res, "Error al obtener citas", 500, error);
    }
});

router.get("/id/:id", async (req, res) => { 
    try {
        const id = parseInt(req.params.id);
        console.log('Buscando cita con ID:', id);

        if (isNaN(id)) {
            return respuesta.error(req, res, "ID de cita inválido", 400);
        }

        const item = await citas.One(id);
        console.log('Cita encontrada:', item);

        if (!item) {
            return respuesta.error(req, res, "Cita no encontrada", 404);
        }

        respuesta.success(req, res, item, 200);
    } catch (error) {    
        console.error("Error al obtener cita:", error);
        respuesta.error(req, res, "Error al obtener cita", 500, error);
    }
});

// Obtener citas por ID de usuario
router.get("/usuario/:usuario_id", async (req, res) => {
    try {
        const usuario_id = parseInt(req.params.usuario_id);
        console.log('Buscando citas del usuario:', usuario_id);

        if (isNaN(usuario_id)) {
            return respuesta.error(req, res, "ID de usuario inválido", 400);
        }

        // Primero verificamos que el usuario existe
        const queryUsuario = "SELECT id, nombre FROM usuarios WHERE id = ?";
        db.conexion.query(queryUsuario, [usuario_id], async (error, usuarios) => {
            if (error) {
                console.error("Error al buscar usuario:", error);
                return respuesta.error(req, res, "Error al buscar usuario", 500, error);
            }

            if (!usuarios || usuarios.length === 0) {
                return respuesta.error(req, res, "Usuario no encontrado", 404);
            }

            // Consulta para obtener todas las citas del usuario
            const queryCitas = `
                SELECT 
                    c.id,
                    c.fecha,
                    c.usuario_id,
                    c.animal_id,
                    c.nombre_usuario,
                    c.nombre_animal
                FROM citas c
                WHERE c.usuario_id = ?
                ORDER BY c.fecha DESC
            `;

            db.conexion.query(queryCitas, [usuario_id], (error, citas) => {
                if (error) {
                    console.error("Error al obtener citas:", error);
                    return respuesta.error(req, res, "Error al obtener citas", 500, error);
                }

                if (!citas || citas.length === 0) {
                    return respuesta.error(req, res, "No se encontraron citas para este usuario", 404);
                }

                respuesta.success(req, res, citas, 200);
            });
        });
    } catch (error) {
        console.error("Error al obtener citas del usuario:", error);
        respuesta.error(req, res, "Error al obtener citas del usuario", 500, error);
    }
});

router.post("/add", async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);
        const { usuario_id, animal_id, fecha } = req.body;

        // Validación más estricta
        if (!usuario_id || !animal_id || !fecha) {
            return respuesta.error(
                req, 
                res, 
                "Faltan datos requeridos para la cita", 
                400
            );
        }

        // Convertir IDs a números y validar
        const usuarioIdNum = parseInt(usuario_id);
        const animalIdNum = parseInt(animal_id);

        if (isNaN(usuarioIdNum) || isNaN(animalIdNum)) {
            return respuesta.error(
                req, 
                res, 
                "IDs de usuario o animal inválidos", 
                400
            );
        }

        // Usar la conexión directamente desde db
        const queryUsuario = "SELECT id, nombre FROM usuarios WHERE id = ?";
        db.conexion.query(queryUsuario, [usuarioIdNum], async (error, usuarios) => {
            if (error) {
                console.error("Error al buscar usuario:", error);
                return respuesta.error(req, res, "Error al buscar usuario", 500, error);
            }

            if (!usuarios || usuarios.length === 0) {
                return respuesta.error(req, res, "Usuario no encontrado", 404);
            }

            const queryAnimal = "SELECT id, nombre, estado_adopcion FROM animales WHERE id = ?";
            db.conexion.query(queryAnimal, [animalIdNum], async (error, animales) => {
                if (error) {
                    console.error("Error al buscar animal:", error);
                    return respuesta.error(req, res, "Error al buscar animal", 500, error);
                }

                if (!animales || animales.length === 0) {
                    return respuesta.error(req, res, "Animal no encontrado", 404);
                }

                const cita = {
                    usuario_id: usuarioIdNum,
                    animal_id: animalIdNum,
                    fecha,
                    nombre_usuario: usuarios[0].nombre,
                    nombre_animal: animales[0].nombre
                };

                try {
                    const resultado = await citas.Add(cita);
                    respuesta.success(req, res, resultado, 201);
                } catch (error) {
                    console.error("Error al crear cita:", error);
                    respuesta.error(
                        req, 
                        res, 
                        `Error al crear cita: ${error.message}`, 
                        500, 
                        error
                    );
                }
            });
        });

    } catch (error) {
        console.error("Error completo:", error);
        respuesta.error(
            req, 
            res, 
            `Error al procesar la cita: ${error.message}`, 
            500, 
            error
        );
    }
});

router.delete("/id/:id", async (req, res) => {  
    try {
        const id = parseInt(req.params.id); 
        console.log('Buscando cita con ID:', id);

        if (isNaN(id)) {
            return respuesta.error(req, res, "ID de cita inválido", 400);
        }

        const citaEliminada = await citas.Delete(id);
        console.log('Cita eliminada:', citaEliminada);

        if (!citaEliminada) {
            return respuesta.error(req, res, "Cita no encontrada", 404);
        }

        respuesta.success(req, res, citaEliminada, 200);
    } catch (error) {
        console.error("Error al eliminar cita:", error);
        respuesta.error(req, res, "Error al eliminar cita", 500, error);
    }    
});     

router.put("/id/:id", async (req, res) => {  
    try {
        const id = parseInt(req.params.id); 
        console.log('Buscando cita con ID:', id);

        if (isNaN(id)) {        
            return respuesta.error(req, res, "ID de cita inválido", 400);
        }    

        const citaActualizada = await citas.Update(id, req.body);   
        console.log('Cita actualizada:', citaActualizada);  

        if (!citaActualizada) {
            return respuesta.error(req, res, "Cita no encontrada", 404);
        }

        respuesta.success(req, res, citaActualizada, 200);  
    } catch (error) {
        console.error("Error al actualizar cita:", error);  
        respuesta.error(req, res, "Error al actualizar cita", 500, error);  
    }            
}); 
 

module.exports = router;