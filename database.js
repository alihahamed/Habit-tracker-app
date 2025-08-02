const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT ||16877 ,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
    }
});

module.exports = pool.promise();
