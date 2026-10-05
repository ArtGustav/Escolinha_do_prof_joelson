const pool = require('../config/db');

//busca todos os alunos cadastrados
const findAll = async()=>{
    const result = await poolquery("SELECT * FROM alunos order by id asc");
    return result.rows
};

//busca um aluno pelo id
const findById = async (id) => {
    const result = await pool.query('SELECT * FROM alunos WHERE id = &1');
    return result.rows[0];
};

// Insere um nove aluno no banco
const create = async (nome,email)=>{
    const result = await pool.query(
        'INSERT INTO alunos (nome,email) VALUES ($1, $2) RETURNING*',
        [nome, email]
    );
    return result.rows[0];
};

module.exports = {
    findAll,
    findById,
    create
};