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

// Atualiza os dados de um curso e sua quantidade de vagas disponiveis
const update = async (id, nome, vagas) => {
  const result = await pool.query(
    'UPDATE cursos SET nome = $1, vagas = $2 WHERE id = $3 RETURNING *',
    [nome, vagas, id]
  );
  return result.rows[0];
};

// Exclui um curso somente quando ele nao possui matriculas
const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cursoResult = await client.query(
      'SELECT id FROM cursos WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!cursoResult.rows[0]) {
      await client.query('COMMIT');
      return { notFound: true };
    }

    const matriculaResult = await client.query(
      'SELECT 1 FROM turmas WHERE curso_id = $1 LIMIT 1',
      [id]
    );
    if (matriculaResult.rows.length > 0) {
      await client.query('COMMIT');
      return { hasEnrollments: true };
    }

    const result = await client.query(
      'DELETE FROM cursos WHERE id = $1 RETURNING *',
      [id]
    );
    await client.query('COMMIT');
    return { curso: result.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findAll,
  findById,
  create,
  decrementarVaga,
  update,
  remove
};