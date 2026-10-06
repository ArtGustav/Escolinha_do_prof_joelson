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
    // tem que colocar o nome do curso da peste e quantas pestes cabem no curso
    if (nome){
        return req.status(400).json({mensagem:'COLOQUE O NOME DO CURSOOOO'})
    }
    try{
        const novoCurso = await cursoRepository.create(nome, vagas);
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
