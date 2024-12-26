const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const appModel = require('../models/app');
const jwt = require('jsonwebtoken');
const { verificarAutenticacao } = require('../middlewares/auth');

const router = express.Router();

// Rota GET /usuarios.html - Serve o arquivo de listagem de usuários (somente autenticados)
router.get('/html', verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/usuarios.html')); // Certifique-se de que o caminho está correto
});

// Rota POST /usuarios (cadastro)
router.post('/',
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    body('categoria').isIn(['administrador', 'utilizador']).withMessage('Categoria inválida'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nome, senha, categoria } = req.body;
        try {
            const usuarioExistente = await appModel.getUserByName(nome);
            if (usuarioExistente) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }

            await appModel.addUsuario(nome, senha, categoria);
            res.status(201).json({ message: 'Usuário criado com sucesso!' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Rota GET /usuarios - listar todos os usuários (somente autenticados)
router.get('/', verificarAutenticacao, async (req, res) => {
    try {
        const usuarios = await appModel.getAllUsuarios();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota DELETE /usuarios/:id - Excluir um usuário pelo ID (somente autenticados)
router.delete('/:id', verificarAutenticacao, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await appModel.deleteUsuario(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota POST /usuarios/login - Login e geração de token JWT
router.post('/login', async (req, res) => {
    const { nome, senha } = req.body;

    try {
        const usuario = await appModel.getUserByName(nome);
        if (!usuario) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const senhaCorreta = await appModel.compararSenha(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, categoria: usuario.categoria },
            'chave-secreta-jwt',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Autenticado com sucesso', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
