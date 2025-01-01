const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Importando a instância do pool

const router = express.Router();

router.post('/', async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }

    try {
        const [results] = await db.execute('SELECT * FROM usuarios WHERE nome = ?', [nome]);

        if (results.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const usuario = results[0];
        const isPasswordValid = await bcrypt.compare(senha, usuario.senha);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Senha inválida' });
        }

        // Configura a sessão do usuário após login
        req.session.userId = usuario.id;
        req.session.userRole = usuario.categoria;  // Define o papel (administrador ou utilizador)

        res.status(200).json({ message: 'Login bem-sucedido', role: usuario.categoria });
    } catch (err) {
        console.error('Erro ao acessar o banco de dados:', err);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }
});

module.exports = router;
