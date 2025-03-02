const mysql = require("mysql2");
const config = require("../config");
const bcrypt = require("bcrypt");

const conexion = mysql.createConnection({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
});

conexion.connect((error) => {
  if (error) {
    console.error("Error de conexión:", error);
    return;
  }
  console.log("Conexión MySQL exitosa - BD:", config.mysql.database);
});

function crearControlador(nombreTabla) {
  return {
    async All() {
      try {
        return new Promise((resolve, reject) => {
          let query;
          switch (nombreTabla) {
            case "animales":
              query = `
                SELECT id, nombre, edad, id_especie, estado_adopcion, 
                CASE 
                  WHEN imagenes IS NOT NULL 
                  THEN CONCAT('data:image/jpeg;base64,', TO_BASE64(imagenes))
                  ELSE NULL 
                END as imagen
                FROM ${nombreTabla}
              `;
              break;
            default:
              query = `SELECT * FROM ${nombreTabla}`;
          }

          conexion.query(query, (error, results) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            resolve(results);
          });
        });
      } catch (error) {
        console.error(`Error en controlador All ${nombreTabla}:`, error);
        throw error;
      }
    },

    async One(id) {
      try {
        return new Promise((resolve, reject) => {
          let query;
          
          // Consultas específicas por tabla
          if (nombreTabla === "citas") {
            query = `
              SELECT 
                c.id,
                c.fecha,
                c.usuario_id,
                c.animal_id,
                c.nombre_usuario,
                c.nombre_animal
              FROM citas c
              WHERE c.id = ?
            `;
          } else {
            query = `SELECT * FROM ${nombreTabla} WHERE id = ?`;
          }

          console.log('Query a ejecutar:', query);
          console.log('ID a buscar:', id);

          conexion.query(query, [id], (error, results) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            console.log('Resultados de la consulta:', results);
            resolve(results[0]);
          });
        });
      } catch (error) {
        console.error(`Error en controlador One ${nombreTabla}:`, error);
        throw error;
      }
    },

    async Add(data) {
      try {
        console.log(`Agregando nueva entrada en ${nombreTabla}:`, data);
        return new Promise((resolve, reject) => {
          const query = `INSERT INTO ${nombreTabla} SET ?`;
          conexion.query(query, data, (error, result) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            resolve({ id: result.insertId, ...data });
          });
        });
      } catch (error) {
        console.error(`Error en controlador Add ${nombreTabla}:`, error);
        throw error;
      }
    },

    async Delete(id) {
      try {
        console.log(`Eliminando ${nombreTabla} ID: ${id}`);
        return new Promise((resolve, reject) => {
          const query = `DELETE FROM ${nombreTabla} WHERE id = ?`;
          conexion.query(query, [id], (error, results) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            resolve(results);
          });
        });
      } catch (error) {
        console.error(`Error en controlador Delete ${nombreTabla}:`, error);
        throw error;
      }
    },

    async Update(id, data) {
      try {
        console.log(`Actualizando ${nombreTabla} ID: ${id}`);
        return new Promise((resolve, reject) => {
          const query = `UPDATE ${nombreTabla} SET ? WHERE id = ?`;
          conexion.query(query, [data, id], (error, results) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            resolve(results);
          });
        });
      } catch (error) {
        console.error(`Error en controlador Update ${nombreTabla}:`, error);
        throw error;
      }
    },

    async FindByEmail(email) {
      try {
        console.log(`Buscando ${nombreTabla} por email:`, email);
        return new Promise((resolve, reject) => {
          const query = `SELECT * FROM ${nombreTabla} WHERE email = ?`;
          conexion.query(query, [email], (error, results) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            resolve(results[0]);
          });
        });
      } catch (error) {
        console.error(`Error en controlador FindByEmail ${nombreTabla}:`, error);
        throw error;
      }
    },

    async Login(email) {
      try {
        console.log(`Buscando ${nombreTabla} por email:`, email);
        return new Promise((resolve, reject) => {
          const query = `SELECT * FROM ${nombreTabla} WHERE email = ?`;
          conexion.query(query, [email], (error, results) => {
            if (error) {
              console.error("Error en query:", error);
              return reject(error);
            }
            resolve(results[0]);
          });
        });
      } catch (error) {
        console.error(`Error en controlador Login ${nombreTabla}:`, error);
        throw error;
      }
    },
  };
}

 
// Exportar controladores específicos
module.exports = {
  animales: crearControlador("animales"),
  usuarios: crearControlador("usuarios"),
  voluntarios: crearControlador("voluntarios"),
  citas: crearControlador("citas"),
};
