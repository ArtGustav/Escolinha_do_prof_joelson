const pool = require('../config/db');

//busca todos os alunos cadastrados
const findAll = async()=>{
    const result = await pool.query("SELECT * FROM alunos ORDER BY id ASC");
    return result.rows
};

//busca um aluno pelo id
const findById = async (id) => {
    const result = await pool.query('SELECT * FROM alunos WHERE id = $1', [id]);
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

// Atualiza os dados de um aluno
const update = async (id, nome, email) => {
    const result = await pool.query(
        'UPDATE alunos SET nome = $1, email = $2 WHERE id = $3 RETURNING *',
        [nome, email, id]
    );
    return result.rows[0];
};

// Exclui um aluno somente quando ele nao possui matriculas
const remove = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const alunoResult = await client.query(
            'SELECT id FROM alunos WHERE id = $1 FOR UPDATE',
            [id]
        );
        if (!alunoResult.rows[0]) {
            await client.query('COMMIT');
            return { notFound: true };
        }

        const matriculaResult = await client.query(
            'SELECT 1 FROM turmas WHERE aluno_id = $1 LIMIT 1',
            [id]
        );
        if (matriculaResult.rows.length > 0) {
            await client.query('COMMIT');
            return { hasEnrollments: true };
        }

        const result = await client.query(
            'DELETE FROM alunos WHERE id = $1 RETURNING *',
            [id]
        );
        await client.query('COMMIT');
        return { aluno: result.rows[0] };
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
    update,
    remove
};