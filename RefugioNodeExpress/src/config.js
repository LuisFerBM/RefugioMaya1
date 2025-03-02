require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 3000,
    },
    mysql: {
        url: process.env.MYSQL_URL,
        // Configuración alternativa si MYSQL_URL no está disponible
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'refugioanimalesmaya'
    }
}