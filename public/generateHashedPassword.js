const bcrypt = require('bcryptjs');

async function gerarSenhas() {
    const senhaAdmin = 'admin123';
    const senhaUser = 'user123';

    // Criptografando a senha do administrador
    const hashedPasswordAdmin = await bcrypt.hash(senhaAdmin, 10);
    console.log('Senha Admin Criptografada:', hashedPasswordAdmin);

    // Criptografando a senha do utilizador
    const hashedPasswordUser = await bcrypt.hash(senhaUser, 10);
    console.log('Senha User Criptografada:', hashedPasswordUser);
}

// Chama a função para gerar e mostrar as senhas criptografadas
gerarSenhas();
