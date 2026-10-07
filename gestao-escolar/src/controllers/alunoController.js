const alunoRepository = require('..//repositories/alunoRepository');

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

//Cria um novo pestinha
const createAluno = async (req,res) => {
    const {nome,email}=req.body;

// a obrigação dos pestinhas
if (!nome || !email) {
    return res.status(400).json({mensagem:'Nome e e-mail são obrigatórios.'});
    }
        try {
            const novoAluno = await alunoRepository.create(nome,email);
            return res.status(201).json(novoAluno);
        } catch (error) {
            // veridicar email duplicado da peste ai no postgres
            if (error.code === '23505'){
                return res.status(409).json({mensagem:'Já existe um aluno cadastrado com esse e-mail.'});
            }
            return res.status(500).json({mensagem: 'não vou cadastrar essa peste por motivos maiores'});
        }
};
module.exports = {
    getAlunos,
    createAluno
};