// usuarios.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Altere para o caminho do seu arquivo de configuração do banco de dados

const router = express.Router();

router.post('/cadastro', async (req, res) => {
    const { nome, senha, categoria } = req.body;

    if (!nome || !senha || !categoria) {
        return res.status(400).json({ error: 'Nome, senha e categoria são obrigatórios' });
    }

    // Criptografar a senha antes de salvar no banco
    const hashedPassword = await bcrypt.hash(senha, 10);

    const query = 'INSERT INTO usuarios (nome, senha, categoria) VALUES (?, ?, ?)';
    db.query(query, [nome, hashedPassword, categoria], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar o usuário' });
        res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    });
});

module.exports = router;
