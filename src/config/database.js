const mysql = require("mysql2/promise");
const env = require("dotenv").config();
const db = mysql.createPool({
  host: "mysql-23d535ef-interno.c.aivencloud.com",
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});
module.exports = db;
