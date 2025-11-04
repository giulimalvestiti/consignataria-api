// conexion.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

let dbConfig = {};

if (process.env.MYSQL_URL) {
  // 🔹 Modo Railway (Private Network)
  dbConfig = process.env.MYSQL_URL;
} else {
  // 🔹 Modo local (localhost)
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  };
}

const conexion = mysql.createConnection(dbConfig);

conexion.connect((error) => {
  if (error) throw error;
  console.log('✅ Conectado a la base de datos');
});

module.exports = { conexion };
