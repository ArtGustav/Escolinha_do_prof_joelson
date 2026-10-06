const pool = require('../config/db');

// Busca todos os cursos
const findAll = async () => {
  const result = await pool.query('SELECT * FROM cursos ORDER BY id ASC');
  return result.rows;
};

// Busca um curso pelo ID (útil para checar vagas e para o Teste 3)
const findById = async (id) => {
  const result = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);
  return result.rows[0];
};

// Cria um novo curso (trata o número de vagas com valor default caso venha undefined)
const create = async (nome, vagas) => {
  const qtdVagas = vagas !== undefined ? vagas : 30;
  const result = await pool.query(
    'INSERT INTO cursos (nome, vagas) VALUES ($1, $2) RETURNING *',
    [nome, qtdVagas]
  );
  return result.rows[0];
};

// Decrementa 1 vaga do curso (chamado após matricular um aluno)
const decrementarVaga = async (id) => {
  const result = await pool.query(
    'UPDATE cursos SET vagas = vagas - 1 WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

module.exports = {
  findAll,
  findById,
  create,
  decrementarVaga
};