# Gestão Escolar

Aplicação web simples para acompanhar alunos, cursos e matrículas de uma escola. O projeto usa Node.js, Express e PostgreSQL; o frontend é servido como arquivos estáticos pelo próprio backend.

## Funcionalidades

- Painel com totais de alunos, cursos, matrículas e vagas.
- Listas com busca para alunos, cursos e matrículas.
- Formulários para cadastrar alunos, cursos e matrículas.
- Interface responsiva em português.
- API REST para consultar e cadastrar registros.

## Requisitos

- Node.js e npm.
- PostgreSQL em execução.

## Instalação e configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um banco de dados PostgreSQL para a aplicação.

3. Copie o arquivo de exemplo de variáveis de ambiente e preencha os dados da sua instalação:

   ```powershell
   Copy-Item .exemple.env .env
   ```

   Configure `.env` com estes valores:

   ```env
   DB_USER=seu_usuario
   DB_HOST=localhost
   DB_NAME=nome_do_banco
   DB_PASSWORD=sua_senha
   DB_PORT=5432
   PORT=3000
   ```

   Não compartilhe nem versione o arquivo `.env`; ele pode conter credenciais.

4. Para criar as tabelas e inserir dados de demonstração, execute:

   ```bash
   psql -U seu_usuario -d nome_do_banco -f database/test-base.sql
   ```

   **Atenção:** `database/test-base.sql` apaga as tabelas `turmas`, `cursos` e `alunos` antes de recriá-las. Use apenas em um banco de teste ou faça backup antes.

## Executar

Inicie a aplicação:

```bash
npm start
```

Em desenvolvimento, com reinicialização automática:

```bash
npm run run
```

Abra `http://localhost:3000` (ou a porta definida por `PORT`). O backend também disponibiliza a API no mesmo endereço.

## API

Os endpoints abaixo estão disponíveis com o prefixo `/api`. As rotas sem `/api` também permanecem registradas por compatibilidade.

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/alunos` | Lista alunos |
| `POST` | `/api/alunos` | Cadastra aluno |
| `GET` | `/api/cursos` | Lista cursos |
| `POST` | `/api/cursos` | Cadastra curso |
| `GET` | `/api/turmas` | Lista matrículas |
| `POST` | `/api/turmas` | Cadastra matrícula |

### Exemplos de cadastro

Cadastre um aluno:

```json
{
  "nome": "Maria da Silva",
  "email": "maria@exemplo.com"
}
```

Cadastre um curso:

```json
{
  "nome": "Matemática básica",
  "vagas": 25
}
```

Cadastre uma matrícula usando os IDs existentes de aluno e curso:

```json
{
  "aluno_id": 1,
  "curso_id": 1
}
```

As requisições `POST` devem enviar `Content-Type: application/json`. Uma matrícula exige aluno e curso existentes, e o curso precisa ter vagas disponíveis. O cadastro de aluno retorna conflito (`409`) quando o e-mail já está em uso.

> **Limitação conhecida:** a rota `GET /api/cursos/:id` está registrada, mas atualmente chama o handler de listagem de cursos, não o de busca por ID. Use `GET /api/cursos` para listar cursos.

## Estrutura do projeto

```text
database/
  test-base.sql       # Criação do schema e dados de demonstração
frontend/
  index.html          # Interface do painel e formulários
  app.js              # Navegação, listagem e chamadas à API
  styles.css          # Estilos e layout responsivo
src/
  config/db.js        # Pool de conexão PostgreSQL
  controllers/        # Validação e respostas HTTP
  repositories/       # Consultas ao banco
  routes/             # Rotas da API
  server.js           # Inicialização do Express e arquivos estáticos
```

## Testes

O projeto ainda não tem testes automatizados configurados. Atualmente, `npm test` retorna a mensagem de que não há testes definidos.
