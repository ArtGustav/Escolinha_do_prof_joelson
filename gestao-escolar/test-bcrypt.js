// Testando bcrypt.js
const bcrypt = require('bcryptjs');
async function testarBcrypt() {
    const senhaPura ="SenhaSeguraçç(MinhaSogra);";
    const SalRounds = 10;

    console.log('---testando bcrypt---');
    console.log("Senha original:",senhaPura);

    //1. Gerando Hashhh
    const hashGerado = await bcrypt.hash(senhaPura, SalRounds);
    console.log('hash Gerado (para guardar no banco de dados):', hashGerado);

    //2. Testar verificação com a senha correta
    const senhaCorreta ="SenhaSeguraçç(MinhaSogra);";
    const ehValida =  await bcrypt.compare(senhaCorreta, hashGerado);
    console.log("Validação com senha correta:",ehValida ? "SUCESSO (true)": "FALHA falsa");

    //3. Testando verificação com a senha incorreta
    const senhaIncorreta = "senhaErradasla";
    const ehInvalida = await bcrypt.compare(senhaIncorreta, hashGerado);
    console.log("Validação com senha incorreta:", !ehInvalida ? "SUCESSO no bloqueio":"Falado sua false")


}
testarBcrypt();