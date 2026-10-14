const cursoRepository = require('../repositories/cursoRepository');

// Valida se o ID informado e um numero inteiro positivo
const isValidId = (id) => {
    const isNumericInput = typeof id === 'number' || (typeof id === 'string' && id.trim() !== '');
    return isNumericInput && Number.isSafeInteger(Number(id)) && Number(id) > 0;
};

// Valida uma quantidade de vagas inteira e nao negativa
const isValidVagas = (vagas) => {
    const isNumericInput = typeof vagas === 'number' || (typeof vagas === 'string' && vagas.trim() !== '');
    return isNumericInput && Number.isSafeInteger(Number(vagas)) && Number(vagas) >= 0;
};

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
    if (!isValidId(id)) {
        return res.status(400).json({mensagem:'O ID do curso deve ser um numero inteiro positivo.'});
    }
    try{
        const curso = await cursoRepository.findById(Number(id));
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
    if (typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).json({mensagem:'O nome do curso é obrigatório.'});
    }
    if (vagas !== undefined && !isValidVagas(vagas)) {
        return res.status(400).json({mensagem:'A quantidade de vagas deve ser um número inteiro igual ou maior que zero.'});
    }
    try{
        const novoCurso = await cursoRepository.create(nome.trim(), vagas);
        return res.status(201).json(novoCurso);
    }catch(error){
        return res.status(500).json({mensagem:'Nosso sistema não quer colocar seu curso felizmente muehehehe'})
    }
};

// Atualiza os dados de um curso
const updateCurso = async (req, res) => {
    const { id } = req.params;
    const { nome, vagas } = req.body;
    if (!isValidId(id)) {
        return res.status(400).json({mensagem:'O ID do curso deve ser um numero inteiro positivo.'});
    }
    if (typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).json({mensagem:'O nome do curso é obrigatório.'});
    }
    if (!isValidVagas(vagas)) {
        return res.status(400).json({mensagem:'A quantidade de vagas deve ser um número inteiro igual ou maior que zero.'});
    }

    try {
        const curso = await cursoRepository.update(Number(id), nome.trim(), Number(vagas));
        if (!curso) {
            return res.status(404).json({mensagem:'Curso nao encontrado.'});
        }
        return res.status(200).json(curso);
    } catch (error) {
        return res.status(500).json({mensagem:'Erro do sistema ao atualizar o curso.'});
    }
};

// Exclui um curso sem matriculas vinculadas
const deleteCurso = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({mensagem:'O ID do curso deve ser um numero inteiro positivo.'});
    }

    try {
        const result = await cursoRepository.remove(Number(id));
        if (result.notFound) {
            return res.status(404).json({mensagem:'Curso nao encontrado.'});
        }
        if (result.hasEnrollments) {
            return res.status(409).json({mensagem:'Nao e possivel excluir um curso que possui matriculas.'});
        }
        return res.status(200).json({mensagem:'Curso excluido com sucesso.', curso: result.curso});
    } catch (error) {
        return res.status(500).json({mensagem:'Erro do sistema ao excluir o curso.'});
    }
};

module.exports = {
    getCursos,
    getCursoId,
    createCurso,
    updateCurso,
    deleteCurso
};
