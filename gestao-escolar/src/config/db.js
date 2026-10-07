// Importa o cliente de pool do postgreSQL (biblioteca'pg)
const {Pool} = require ('pg');
// Carrega as variaveius de ambiente do arquivo .env
require('dotenv').config();

// Configura a conexão usando as variáveis do .env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});

module.exports=pool;