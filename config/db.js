const mysql = require('mysql2');
require('dotenv').config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // puedes ajustar este número según tu necesidad
  queueLimit: 0
});
// Conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos correctamente');
    connection.release(); // Liberar la conexión después de usarla
  }
});

// pool.connect((err) => {
//   if (err) {
//     console.error('Error al conectar a la base de datos:', err.message);
//   } else {
//     console.log('Conectado a la base de datos correctamente');
//   }
// });

const db = pool.promise(); // 👈 esto permite usar async/await

module.exports = db;