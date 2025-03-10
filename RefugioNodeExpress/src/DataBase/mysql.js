const mysql = require("mysql2");
const config = require("../config");
const bcrypt = require("bcrypt");

let conexion;

// Usar URL de Railway si está disponible, sino usar configuración local
if (process.env.MYSQL_URL) {
    conexion = mysql.createConnection(process.env.MYSQL_URL);
} else {
    conexion = mysql.createConnection({
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
    });
}

conexion.connect((error) => {
    if (error) {
        console.error("Error de conexión:", error);
        return;
    }
    console.log("Conexión MySQL exitosa - BD:", config.mysql.database);
});

// Modificar la función All para incluir el caso de citas
async function All(nombreTabla) {
  try {
    return new Promise((resolve, reject) => {
      let query;

      // Consultas específicas por tabla
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

      console.log("Query:", query);

      conexion.query(query, (error, results) => {
        if (error) {
          console.error("Error en query:", error);
          return reject(error);
        }
        console.log(`Registros en ${nombreTabla}:`, results.length);
        resolve(results);
      });
    });
  } catch (error) {
    console.error("Error en All:", error);
    throw error;
  }
}

async function One(nombreTabla, id) {
  try {
    return new Promise((resolve, reject) => {
      let query;
      let params = [id];

      if (nombreTabla === "citas") {
        query = `SELECT 
          c.id,
          c.fecha,
          c.usuario_id,
          c.animal_id,
          c.nombre_usuario,
          c.nombre_animal
        FROM citas c
        WHERE c.id = ?`;
      } else if (nombreTabla === "estado") {
        query = `
          SELECT 
            e.*,
            a.nombre as nombre_animal,
            a.id_especie
          FROM estado e
          LEFT JOIN animales a ON e.id_animal = a.id
          WHERE e.id = ?
        `;
      } else {
        query = `SELECT * FROM ${nombreTabla} WHERE id = ?`;
      }

      console.log("Query:", query);
      console.log("Params:", params);

      conexion.query(query, params, (error, results) => {
        if (error) {
          console.error("Error en query:", error);
          return reject(error);
        }
        console.log("Resultados:", results);
        resolve(results[0]);
      });
    });
  } catch (error) {
    console.error("Error en One:", error);
    throw error;
  }
}

async function Add(nombreTabla, data) {
  try {
    return new Promise((resolve, reject) => {
      if (nombreTabla === "citas") {
        const citaData = {
          usuario_id: data.usuario_id,
          animal_id: data.animal_id,
          fecha: data.fecha,
          nombre_usuario: data.nombre_usuario,
          nombre_animal: data.nombre_animal
        };

        const query = `INSERT INTO citas SET ?`;
        conexion.query(query, citaData, (error, result) => {
          if (error) {
            console.error("Error al insertar cita:", error);
            return reject(error);
          }

          // Obtener la cita recién creada
          const selectQuery = `
            SELECT *
            FROM citas
            WHERE id = ?
          `;
          
          conexion.query(selectQuery, [result.insertId], (error, results) => {
            if (error) {
              console.error("Error al obtener cita creada:", error);
              return reject(error);
            }
            resolve(results[0]);
          });
        });
        return;
      } else if (nombreTabla === "animales") {
        // Asegurarse de que todos los campos necesarios estén presentes
        const animalData = {
          nombre: data.nombre,
          edad: data.edad,
          id_especie: data.id_especie,
          estado_adopcion: data.estado_adopcion,
          imagenes: data.imagenes || Buffer.from('') // Buffer vacío si no hay imagen
        };

        const query = `INSERT INTO animales SET ?`;
        conexion.query(query, animalData, (error, result) => {
          if (error) {
            console.error("Error al insertar animal:", error);
            return reject(error);
          }

          // Obtener el animal recién creado
          const selectQuery = `
            SELECT 
              id, 
              nombre, 
              edad, 
              id_especie, 
              estado_adopcion,
              CASE 
                WHEN imagenes IS NOT NULL 
                THEN CONCAT('data:image/jpeg;base64,', TO_BASE64(imagenes))
                ELSE NULL 
              END as imagen
            FROM animales 
            WHERE id = ?
          `;
          
          conexion.query(selectQuery, [result.insertId], (error, results) => {
            if (error) {
              console.error("Error al obtener animal creado:", error);
              return reject(error);
            }
            resolve(results[0]);
          });
        });
        return;
      } else if (nombreTabla === "voluntarios") {
        console.log("Iniciando registro de voluntario:", data);
        
        // Primero obtener un animal aleatorio con JOIN para asegurar la relación
        const insertWithAnimalQuery = `
            INSERT INTO voluntarios (nombre, telefono, email, id_animal)
            SELECT 
                ?,
                ?,
                ?,
                id
            FROM animales 
            ORDER BY RAND() 
            LIMIT 1
        `;

        const voluntarioData = [data.nombre, data.telefono, data.email];

        conexion.query(insertWithAnimalQuery, voluntarioData, (error, result) => {
            if (error) {
                console.error("Error al insertar voluntario:", error);
                return reject(error);
            }

            // Obtener el voluntario creado con el nombre del animal
            const selectQuery = `
                SELECT 
                    v.*,
                    a.nombre as nombre_animal
                FROM voluntarios v
                INNER JOIN animales a ON v.id_animal = a.id
                WHERE v.id = ?
            `;

            conexion.query(selectQuery, [result.insertId], (error, results) => {
                if (error) {
                    console.error("Error al obtener voluntario:", error);
                    return reject(error);
                }
                console.log("Voluntario creado:", results[0]);
                resolve(results[0]);
            });
        });
        return;
      }

      const query = `INSERT INTO ${nombreTabla} SET ?`;
      conexion.query(query, data, (error, results) => {
        if (error) {
          console.error("Error en query:", error);
          return reject(error);
        }
        resolve(results);
      });
        
       
    });
  } catch (error) {
    console.error("Error en Add:", error);
    throw error;
  }
}

async function Delete(nombreTabla, id) {
  try { 
    return new Promise((resolve, reject) => {
      let query;
      
      // Manejar casos específicos por tabla
      switch (nombreTabla) {
        case "estado":
          query = `DELETE FROM estado WHERE id = ?`;  // Corregido de id_estado a id
          break;
        default:
          query = `DELETE FROM ${nombreTabla} WHERE id = ?`;
      }

      console.log("Query de eliminación:", query, "ID:", id);

      conexion.query(query, [id], (error, results) => {
        if (error) {
          console.error("Error en Delete:", error);
          return reject(error);
        }
        
        if (results.affectedRows === 0) {
          return reject(new Error(`No se encontró el registro en ${nombreTabla}`));
        }
        
        resolve({ 
          message: `${nombreTabla} eliminado correctamente`,
          affectedRows: results.affectedRows 
        });
      });
    });
  } catch (error) {
    console.error("Error en Delete:", error);
    throw error;  
  } 
} 

async function Update(nombreTabla, id, data) {
  try {
    return new Promise(async (resolve, reject) => {
      switch (nombreTabla) {
        case "usuarios":
          // Si se está actualizando la contraseña
          if (data.password) {
            try {
              // Generar hash de la nueva contraseña
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(data.password, salt);
              
              // Reemplazar password con password_hash
              data = {
                ...data,
                password_hash: hashedPassword
              };
              delete data.password; // Eliminar el password en texto plano
            } catch (error) {
              return reject(new Error("Error al hashear la contraseña"));
            }
          }

          // Realizar la actualización
          const query = `UPDATE ${nombreTabla} SET ? WHERE id = ?`;
          conexion.query(query, [data, id], (error, results) => {
            if (error) {
              return reject(error);
            }
            if (results.affectedRows === 0) {
              return reject(new Error("Usuario no encontrado"));
            }
            
            // Obtener usuario actualizado (sin password_hash)
            conexion.query(
              `SELECT id, nombre, email, rol FROM usuarios WHERE id = ?`,
              [id],
              (error, userResults) => {
                if (error) {
                  return reject(error);
                }
                resolve(userResults[0]);
              }
            );
          });
          break;

        default:
          const defaultQuery = `UPDATE ${nombreTabla} SET ? WHERE id = ?`;
          conexion.query(defaultQuery, [data, id], (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          });
      }
    });
  } catch (error) {
    console.error("Error en Update:", error);
    throw error;
  }
}

async function Login(tabla, email) {
  try {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id,
          nombre,
          email,
          password_hash,
          rol
        FROM ${tabla}
        WHERE email = ?
        LIMIT 1
      `;

      conexion.query(query, [email], (error, results) => {
        if (error) {
          console.error("Error en consulta SQL:", error);
          return reject(new Error("Error en la base de datos"));
        }

        if (!results || results.length === 0) {
          return reject(new Error("Usuario no encontrado"));
        }

        const usuario = results[0];
        resolve(usuario); // Devolvemos el usuario completo con password_hash
      });
    });
  } catch (error) {
    console.error("Error en Login:", error);
    throw new Error("Error al iniciar sesión");
  }
}

async function FindByEmail(email) {
  try { 
    return new Promise((resolve, reject) => {      
      // Validar que el email no esté vacío
      if (!email) {
        return reject(new Error("Email requerido"));
      }

      const query = `SELECT id, email FROM usuarios WHERE email = ?`;
      
      conexion.query(query, [email], (error, results) => {
        if (error) {
          console.error("Error en consulta:", error);
          return reject(new Error("Error en la base de datos"));
        }

        // Devolver solo el primer resultado si existe
        resolve(results[0] || null);
      });
    });
  } catch (error) {
    console.error("Error en FindByEmail:", error);
    throw new Error("Error al buscar por email");
  } 
}

async function OneByAnimal(idAnimal) {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    e.*,
                    a.nombre as nombre_animal,
                    a.id_especie
                FROM estado e
                LEFT JOIN animales a ON e.id_animal = a.id
                WHERE e.id_animal = ?
            `;
            
            console.log("Query OneByAnimal:", query);
            console.log("Params:", idAnimal);
            
            conexion.query(query, [idAnimal], (error, results) => {
                if (error) {
                    console.error("Error en query:", error);
                    return reject(error);
                }
                console.log("Resultados:", results);
                resolve(results[0]); // Devuelve el primer resultado
            });
        });
    } catch (error) {
        console.error("Error en OneByAnimal:", error);
        throw error;
    }
}

module.exports = {
    conexion,
    All,
    One,
    Add,
    Delete,
    Update,
    FindByEmail,
    Login,
    OneByAnimal
};
