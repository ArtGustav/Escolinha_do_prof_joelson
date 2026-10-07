-- 0. Limpeza total do ambiente (Apaga na ordem inversa das dependências)
DROP TABLE IF EXISTS turmas;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS alunos;

-- 1. Criação da tabela de Alunos
CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Criação da tabela de Cursos
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    vagas INT NOT NULL DEFAULT 0
);

-- 3. Criação da tabela de Turmas (Matrículas)
CREATE TABLE turmas (
    id SERIAL PRIMARY KEY,
    aluno_id INT REFERENCES alunos(id) ON DELETE CASCADE,
    curso_id INT REFERENCES cursos(id) ON DELETE CASCADE,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inserindo Dados Mockados para Testes
INSERT INTO alunos (nome, email) VALUES
('Ana Silva', 'ana@email.com'),
('Carlos Santos', 'carlos@email.com'),
('Beatriz Costa', 'beatriz@email.com'),
('Daniel Oliveira', 'daniel@email.com'),
('Eduarda Souza', 'eduarda@email.com'),
('Felipe Lima', 'felipe@email.com'),
('Gabriela Pereira', 'gabriela@email.com'),
('Henrique Almeida', 'henrique@email.com'),
('Isabela Martins', 'isabela@email.com'),
('João Pedro', 'joao@email.com');

INSERT INTO cursos (nome, vagas) VALUES
('Lógica de Programação', 20),
('Banco de Dados SQL', 2),      -- Atenção: Este curso só tem 2 vagas!
('Node.js Avançado', 0),        -- Atenção: Este curso já está lotado!
('React.js para Iniciantes', 15),
('Arquitetura de Software', 10),
('Python para Ciência de Dados', 5);