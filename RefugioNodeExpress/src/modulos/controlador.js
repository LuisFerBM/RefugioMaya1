const db = require("../DataBase/mysql");

function crearControlador(nombreTabla) {
  return {
    async All() {
      return await db.All(nombreTabla);
    },

    async One(id) {
      return await db.One(nombreTabla, id);
    },

    async Add(data) {
      return await db.Add(nombreTabla, data);
    },

    async Delete(id) {
      return await db.Delete(nombreTabla, id);
    },

    async Update(id, data) {
      return await db.Update(nombreTabla, id, data);
    },

    async FindByEmail(email) {
      return await db.FindByEmail(email);
    },

    async Login(email) {
      return await db.Login(nombreTabla, email);
    },
    // Nueva función para buscar estado por ID de animal
    async OneByAnimal(idAnimal) {
      return db.OneByAnimal(idAnimal);
    },
  };
}

// Exportar controladores específicos
module.exports = {
  animales: crearControlador("animales"),
  usuarios: crearControlador("usuarios"),
  voluntarios: crearControlador("voluntarios"),
  citas: crearControlador("citas"),
  especies: crearControlador("especies"),
  estado: crearControlador("estado"),
};
