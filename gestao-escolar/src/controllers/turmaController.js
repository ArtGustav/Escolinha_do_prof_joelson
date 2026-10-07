const turmaRepository = require('../repositories/turmaRepository');
const cursoRepository = require('../repositories/cursoRepository');
const alunoRepository = require('../repositories/alunoRepository');

//liata todas as turmas das pestana(s 
const getTurmas = async (req, res) => {
    try {
        const turmas = await turmaRepository.findAll();
        return res.status(200).json(turmas);
    } catch (error){
        return res.status(500).json({mensagem:'sistema não quer buscar as turmas não'});
    }
};

// Cria uma nova matrícula para a peste
const createTurma = async (req,res) => {
    const {aluno_id, curso_id} = req.body
    if (!aluno_id || !curso_id){
        return res.status(400).json({mensagem:'Campos da pestinha_id e cursinho_id é pra fazer!!!!!'})
    }
    try {
        // primeiro verificamos se a peste existe
        const aluno = await alunoRepository.findById(aluno_id);
        if (!aluno){
            return res.status(404).json({mensagem:'Peste não encontrada'})
        }

        // busca o curso pra ver quastas pestes tem e quantas ainda cabem
        const curso = await cursoRepository.findById(curso_id);
        if (!curso){
            return res.status(404).json({mensagem:'Não cabe mais pestes aqui (ta chei de peste aq)'})
        }
        if (Number(curso.vagas) <= 0) {
            return res.status(409).json({mensagem:'Este curso não tem vagas disponíveis.'});
        }
        // cria a matricula na tabela de turmas
        const novaMatricula = await turmaRepository.create(aluno_id,curso_id);

        //decrementa 1 vaga de curso
        await cursoRepository.decrementarVaga(curso_id);

        return res.status(201).json({
            mensagem: 'peste matriculada com susseso felizmente muahahahh',
            matricula: novaMatricula
        });

    } catch (error){
        return res.status(500).json({mensagem:'Erro do sistema ao matricular a peste'})
    }
};

module.exports = {
    getTurmas,
    createTurma
}
