const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

router.get('/', alunoController.getAlunos);
router.post('/', alunoController.createAluno);

module.exports =  router;