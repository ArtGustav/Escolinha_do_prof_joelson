const alunoRepository = require('..//repositories/alunoRepository');

// Valida se o ID informado e um numero inteiro positivo
const isValidId = (id) => {
    const isNumericInput = typeof id === 'number' || (typeof id === 'string' && id.trim() !== '');
    return isNumericInput && Number.isSafeInteger(Number(id)) && Number(id) > 0;
};

//lista pestinhas
const getAlunos = async (req,res) => {
    try{
        const alunos = await alunoRepository.findAll();
        return res.status(200).json(alunos);
    }catch(error){
        return res.status(500).json({
            mensagem:'Não vai buscar pestinhas'
        })
    }
};

// Busca um aluno pelo ID
const getAlunoById = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ mensagem: 'O ID do aluno deve ser um numero inteiro positivo.' });
    }

    try {
        const aluno = await alunoRepository.findById(Number(id));
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno nao encontrado.' });
        }
        return res.status(200).json(aluno);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro do sistema ao buscar o aluno.' });
    }
};

//Cria um novo pestinha
const createAluno = async (req,res) => {
    const {nome,email}=req.body;

// a obrigação dos pestinhas
if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({mensagem:'Nome e e-mail são obrigatórios.'});
    }
        try {
            const novoAluno = await alunoRepository.create(nome.trim(), email.trim());
            return res.status(201).json(novoAluno);
        } catch (error) {
            // veridicar email duplicado da peste ai no postgres
            if (error.code === '23505'){
                return res.status(409).json({mensagem:'Já existe um aluno cadastrado com esse e-mail.'});
            }
            return res.status(500).json({mensagem: 'não vou cadastrar essa peste por motivos maiores'});
        }
};

// Atualiza os dados de um aluno
const updateAluno = async (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;
    if (!isValidId(id)) {
        return res.status(400).json({ mensagem: 'O ID do aluno deve ser um numero inteiro positivo.' });
    }
    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ mensagem: 'Nome e e-mail são obrigatórios.' });
    }

    try {
        const aluno = await alunoRepository.update(Number(id), nome.trim(), email.trim());
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno nao encontrado.' });
        }
        return res.status(200).json(aluno);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ mensagem: 'Já existe um aluno cadastrado com esse e-mail.' });
        }
        return res.status(500).json({ mensagem: 'Erro do sistema ao atualizar o aluno.' });
    }
};

// Exclui um aluno sem matriculas vinculadas
const deleteAluno = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ mensagem: 'O ID do aluno deve ser um numero inteiro positivo.' });
    }

    try {
        const result = await alunoRepository.remove(Number(id));
        if (result.notFound) {
            return res.status(404).json({ mensagem: 'Aluno nao encontrado.' });
        }
        if (result.hasEnrollments) {
            return res.status(409).json({ mensagem: 'Nao e possivel excluir um aluno que possui matriculas.' });
        }
        return res.status(200).json({ mensagem: 'Aluno excluido com sucesso.', aluno: result.aluno });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro do sistema ao excluir o aluno.' });
    }
};

module.exports = {
    getAlunos,
    getAlunoById,
    createAluno,
    updateAluno,
    deleteAluno
};