const cursoRepository = require('../repositories/cursoRepository');

//lista todas os cursos das pestes
const getCursos = async (req,res) => {
    try {
        const cursos = await cursoRepository.findAll();
        return res.status(200).json(cursos);
    } catch (error){
        return res.status(500).json({mensagem:'Ouve um erro quando bucaram os curos, sem aula hoje'})
    }
};

//buscar um curso pelo id (para teste 3)
const getCursoId = async (req,res) => {
    const {id} = req.params;
    try{
        const curso = await cursoRepository.findById(id);
        if (!curso){
            return res.status(404).json({mensagem:'Achei esse curso ai não viss'})
        }
        return res.status(200).json(curso);
    }catch (error){
        return res.status(500).json({mensagem:'Sistema não quer buscar o curso, vai procrastinar'})
    }

};

//Criando um novo curso ae boy
const createCurso = async (req,res) => {
    const {nome, vagas} = req.body;
    if (!nome || !nome.trim()) {
        return res.status(400).json({mensagem:'O nome do curso é obrigatório.'});
    }
    if (vagas !== undefined && (!Number.isInteger(Number(vagas)) || Number(vagas) < 0)) {
        return res.status(400).json({mensagem:'A quantidade de vagas deve ser um número inteiro igual ou maior que zero.'});
    }
    try{
        const novoCurso = await cursoRepository.create(nome.trim(), vagas);
        return res.status(201).json(novoCurso);
    }catch(error){
        return res.status(500).json({mensagem:'Nosso sistema não quer colocar seu curso felizmente muehehehe'})
    }
};

module.exports = {
    getCursos,
    getCursoId,
    createCurso
};
