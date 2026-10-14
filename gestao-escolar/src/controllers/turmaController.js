const turmaRepository = require('../repositories/turmaRepository');
const alunoRepository = require('../repositories/alunoRepository');

// Valida se o ID informado e um numero inteiro positivo
const isValidId = (id) => {
    const isNumericInput = typeof id === 'number' || (typeof id === 'string' && id.trim() !== '');
    return isNumericInput && Number.isSafeInteger(Number(id)) && Number(id) > 0;
};

// Lista todas as matriculas
const getTurmas = async (req, res) => {
    try {
        const turmas = await turmaRepository.findAll();
        return res.status(200).json(turmas);
    } catch (error){
        return res.status(500).json({mensagem:'sistema não quer buscar as turmas não'});
    }
};

// Busca uma matricula pelo ID
const getTurmaById = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ mensagem: 'O ID da matricula deve ser um numero inteiro positivo.' });
    }

    try {
        const turma = await turmaRepository.findById(Number(id));
        if (!turma) {
            return res.status(404).json({ mensagem: 'Matricula nao encontrada.' });
        }

        return res.status(200).json(turma);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro do sistema ao buscar a matricula.' });
    }
};

// Cria uma nova matricula
const createTurma = async (req, res) => {
    const { aluno_id, curso_id } = req.body;
    if (!isValidId(aluno_id) || !isValidId(curso_id)) {
        return res.status(400).json({ mensagem: 'Informe IDs validos para o aluno e o curso.' });
    }

    try {
        const aluno = await alunoRepository.findById(Number(aluno_id));
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno nao encontrado.' });
        }

        const novaMatricula = await turmaRepository.create(Number(aluno_id), Number(curso_id));
        return res.status(201).json({
            mensagem: 'Matricula criada com sucesso.',
            matricula: novaMatricula
        });
    } catch (error) {
        if (error.code === 'COURSE_NOT_FOUND') {
            return res.status(404).json({ mensagem: 'Curso nao encontrado.' });
        }
        if (error.code === 'NO_AVAILABLE_SEATS') {
            return res.status(409).json({ mensagem: 'Este curso nao tem vagas disponiveis.' });
        }
        return res.status(500).json({ mensagem: 'Erro do sistema ao criar a matricula.' });
    }
};

// Atualiza uma matricula existente
const updateTurma = async (req, res) => {
    const { id } = req.params;
    const { aluno_id, curso_id } = req.body;
    if (!isValidId(id) || !isValidId(aluno_id) || !isValidId(curso_id)) {
        return res.status(400).json({ mensagem: 'Informe IDs validos para a matricula, o aluno e o curso.' });
    }

    try {
        const aluno = await alunoRepository.findById(Number(aluno_id));
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno nao encontrado.' });
        }

        const matricula = await turmaRepository.update(Number(id), Number(aluno_id), Number(curso_id));
        if (!matricula) {
            return res.status(404).json({ mensagem: 'Matricula nao encontrada.' });
        }
        return res.status(200).json({
            mensagem: 'Matricula atualizada com sucesso.',
            matricula
        });
    } catch (error) {
        if (error.code === 'COURSE_NOT_FOUND') {
            return res.status(404).json({ mensagem: 'Curso nao encontrado.' });
        }
        if (error.code === 'NO_AVAILABLE_SEATS') {
            return res.status(409).json({ mensagem: 'Este curso nao tem vagas disponiveis.' });
        }
        return res.status(500).json({ mensagem: 'Erro do sistema ao atualizar a matricula.' });
    }
};

// Exclui uma matricula e devolve a vaga ao curso
const deleteTurma = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ mensagem: 'O ID da matricula deve ser um numero inteiro positivo.' });
    }

    try {
        const matricula = await turmaRepository.remove(Number(id));
        if (!matricula) {
            return res.status(404).json({ mensagem: 'Matricula nao encontrada.' });
        }
        return res.status(200).json({
            mensagem: 'Matricula excluida com sucesso.',
            matricula
        });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro do sistema ao excluir a matricula.' });
    }
};

module.exports = {
    getTurmas,
    getTurmaById,
    createTurma,
    updateTurma,
    deleteTurma
};
