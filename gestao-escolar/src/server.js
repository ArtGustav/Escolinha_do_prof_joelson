const express = require('express');
const path = require('node:path');
require('dotenv').config();

const alunoRoutes = require('./routes/alunoRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const turmaRoutes = require('./routes/turmaRoutes');

const app = express();

// midleware para processar o json nas requisições
app.use(express.json());

//Mapeamento das rotas
app.use('/alunos', alunoRoutes);
app.use('/cursos', cursoRoutes);
app.use('/turmas', turmaRoutes);

app.use('/api/alunos', alunoRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/turmas', turmaRoutes);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Backend e frontend disponíveis em http://localhost:${PORT}`);
});

server.on('error', (error) => {
    console.error(`Não foi possível iniciar o servidor na porta ${PORT}: ${error.message}`);
    process.exitCode = 1;
});