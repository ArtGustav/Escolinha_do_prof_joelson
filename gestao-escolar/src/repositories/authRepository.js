const db = require('../config/db');

class AuthRepository {
    async function buscarPorEmail(email) {
    //ajuste a query e a tabela conforme e a tabeça conforme o seu banco
    const query = 'SELECT * FROM usarios WHERE email = $1';
    const {rows}= await db.query(query,[email]);
    return rows[0];
    }
}