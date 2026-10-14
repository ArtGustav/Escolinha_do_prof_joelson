const pool = require('../config/db');

// Executa uma operação de matrícula com atualização de vagas na mesma transação
const withTransaction = async (operation) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Cria um erro de domínio para situações esperadas nas matrículas
const createError = (code) => Object.assign(new Error(code), { code });

// Busca todas as matrículas trazendo os nomes do aluno e do curso usando INNER JOIN (Bônus)
const findAll = async () => {
  const query = `
    SELECT 
      t.id, 
      t.aluno_id,
      t.curso_id,
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

// Busca uma matrícula pelo ID trazendo os nomes do aluno e do curso
const findById = async (id) => {
  const query = `
    SELECT
      t.id,
      t.aluno_id,
      t.curso_id,
      a.nome AS aluno_nome,
      c.nome AS curso_nome,
      t.data_matricula
    FROM turmas t
    INNER JOIN alunos a ON t.aluno_id = a.id
    INNER JOIN cursos c ON t.curso_id = c.id
    WHERE t.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Cria a matrícula na tabela turmas
const create = async (aluno_id, curso_id) => {
  return withTransaction(async (client) => {
    const cursoResult = await client.query(
      'SELECT id, vagas FROM cursos WHERE id = $1 FOR UPDATE',
      [curso_id]
    );
    const curso = cursoResult.rows[0];
    if (!curso) throw createError('COURSE_NOT_FOUND');
    if (Number(curso.vagas) <= 0) throw createError('NO_AVAILABLE_SEATS');

    const result = await client.query(
      'INSERT INTO turmas (aluno_id, curso_id) VALUES ($1, $2) RETURNING *',
      [aluno_id, curso_id]
    );
    await client.query('UPDATE cursos SET vagas = vagas - 1 WHERE id = $1', [curso_id]);
    return result.rows[0];
  });
};

// Atualiza os dados da matrícula e ajusta as vagas se o curso for alterado
const update = async (id, aluno_id, curso_id) => {
  return withTransaction(async (client) => {
    const matriculaResult = await client.query(
      'SELECT id, curso_id FROM turmas WHERE id = $1 FOR UPDATE',
      [id]
    );
    const matricula = matriculaResult.rows[0];
    if (!matricula) return null;

    const cursoAnteriorId = Number(matricula.curso_id);
    const novoCursoId = Number(curso_id);

    if (cursoAnteriorId !== novoCursoId) {
      const cursosResult = await client.query(
        'SELECT id, vagas FROM cursos WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
        [[cursoAnteriorId, novoCursoId]]
      );
      const cursoNovo = cursosResult.rows.find((curso) => Number(curso.id) === novoCursoId);
      const cursoAnterior = cursosResult.rows.find((curso) => Number(curso.id) === cursoAnteriorId);

      if (!cursoNovo) throw createError('COURSE_NOT_FOUND');
      if (!cursoAnterior) throw createError('ORIGINAL_COURSE_NOT_FOUND');
      if (Number(cursoNovo.vagas) <= 0) throw createError('NO_AVAILABLE_SEATS');

      await client.query('UPDATE cursos SET vagas = vagas + 1 WHERE id = $1', [cursoAnteriorId]);
      await client.query('UPDATE cursos SET vagas = vagas - 1 WHERE id = $1', [novoCursoId]);
    } else {
      const cursoResult = await client.query(
        'SELECT id FROM cursos WHERE id = $1',
        [novoCursoId]
      );
      if (!cursoResult.rows[0]) throw createError('COURSE_NOT_FOUND');
    }

    const result = await client.query(
      'UPDATE turmas SET aluno_id = $1, curso_id = $2 WHERE id = $3 RETURNING *',
      [aluno_id, novoCursoId, id]
    );
    return result.rows[0];
  });
};

// Remove a matrícula e devolve a vaga ao curso
const remove = async (id) => {
  return withTransaction(async (client) => {
    const matriculaResult = await client.query(
      'SELECT id, curso_id FROM turmas WHERE id = $1 FOR UPDATE',
      [id]
    );
    const matricula = matriculaResult.rows[0];
    if (!matricula) return null;

    await client.query('UPDATE cursos SET vagas = vagas + 1 WHERE id = $1', [matricula.curso_id]);
    const result = await client.query(
      'DELETE FROM turmas WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};