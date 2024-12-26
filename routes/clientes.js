const express = require('express');
const { body, validationResult } = require('express-validator');
const appModel = require('../models/app');
const router = express.Router();

// Rota para adicionar um novo cliente
router.post(
    '/',
    [
        body('nome').notEmpty().withMessage('Nome é obrigatório'),
        body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
        body('endereco').notEmpty().withMessage('Endereço é obrigatório'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nome, telefone, endereco } = req.body;

        try {
            const result = await appModel.addCliente(nome, telefone, endereco);
            res.status(201).json({ message: 'Cliente cadastrado com sucesso!', result });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Rota para listar todos os clientes
router.get('/', async (req, res) => {
    try {
        const clientes = await appModel.getAllClientes();
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para excluir um cliente pelo ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await appModel.deleteCliente(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json({ message: 'Cliente excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para atualizar um cliente pelo ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, endereco } = req.body;

    try {
        const result = await appModel.updateCliente(id, nome, telefone, endereco);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
