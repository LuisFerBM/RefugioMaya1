const app = require('./app');
const express = require('express');

//inicio el servidor
app.listen(app.get("port"), () => {
    console.log("Servidor corriendo en el puerto", app.get("port"));
});



