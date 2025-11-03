//Llamar al componente de mysql
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();


//Establecer los parámetros de la conexión
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});
 
//Nos conectamos con la base
conexion.connect(function (error) {
    if (error) throw error;
    console.log('Conectado a la base de datos');
});

//Exportamos el objeto con los datos de la conexión
module.exports = { conexion };