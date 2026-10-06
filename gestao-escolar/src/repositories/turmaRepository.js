const pool = require('../config/db');

// Busca todas as matrículas trazendo os nomes do aluno e do curso usando INNER JOIN (Bônus)
const findAll = async () => {
  const query = `
    SELECT 
      t.id, 
      a.nome AS aluno_nome, 
      c.nome AS curso_nome, 
      t.data_matricula
    FROM turmas t
    INNER JOIN alunos a ON t.aluno_id = a.id
    INNER JOIN cursos c ON t.curso_id = c.id
    ORDER BY t.id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Cria a matrícula na tabela turmas
const create = async (aluno_id, curso_id) => {
  const result = await pool.query(
    'INSERT INTO turmas (aluno_id, curso_id) VALUES ($1, $2) RETURNING *',
    [aluno_id, curso_id]
  );
  return result.rows[0];
};

module.exports = {
  findAll,
  create
};