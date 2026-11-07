const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dateStrings: true, // para que DATETIME y DATE se devuelvan como strings
    decimalNumbers: true, // para que DECIMAL y NUMERIC se devuelvan como numbers
});

module.exports = pool;