const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');

router.get('/', turmaController.getTurmas);
router.post('/', turmaController.createTurma);

module.exports = router;