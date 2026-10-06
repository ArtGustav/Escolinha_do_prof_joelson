// Importa o cliente de pool do postgreSQL (biblioteca'pg)
const {Pool} = require ('pg');
// Carrega as variaveius de ambiente do arquivo .env
require('dotenv').config();

//configura a conexao usando a String ou credenciais do .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports=pool;