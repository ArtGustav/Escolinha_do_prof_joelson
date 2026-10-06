const express = require('express');
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> {
    console.log('Estou aberto')
})