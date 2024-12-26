const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const appModel = require('../models/app');

const router = express.Router();

// Regras de validação
const validationRules = [
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('categoria').isIn(['administrador', 'utilizador']).withMessage('Categoria inválida')
];

// Rota GET /cadastro (exibe o formulário de cadastro)
router.get('/', (req, res) => {
  // Caminho absoluto para 'cadastro.html'
  res.sendFile(path.join(__dirname, '..', 'public', 'cadastro.html'));
});

// Rota POST /cadastro (realiza o cadastro de usuário)
router.post('/', validationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      message: 'Verifique os campos e tente novamente.'
    });
  }

  const { nome, senha, categoria } = req.body;
  try {
    // Verifica se o usuário já existe
    const userExists = await appModel.getUserByName(nome);
    if (userExists) {
      return res.status(400).json({ errors: [{ msg: 'Nome de usuário já existe!' }] });
    }

    // Criptografa a senha
    //const hash = await bcrypt.hash(senha, 10);
    const hashedSenha = await bcrypt.hash(senha, 10);


    // Inserindo o usuário no banco de dados
    const result = await appModel.addUsuario(nome, hashedSenha, categoria, 'ativo');
    return res.status(201).json({ message: 'Usuário criado com sucesso!', result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cadastrar o usuário', message: err.message });
  }
});

module.exports = router;
