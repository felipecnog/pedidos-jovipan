const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Função para gerar um código único
async function gerarCodigoUnico() {
    try {
        let codigo;
        let codigoExiste;

        do {
            // Gera um código de 6 dígitos numéricos
            codigo = String(Math.floor(100000 + Math.random() * 900000));

            // Verifica se o código já existe no banco de dados
            const query = `SELECT COUNT(*) AS count FROM pedidos WHERE codigo = ?`;
            const [rows] = await db.execute(query, [codigo]);

            codigoExiste = rows[0].count > 0;
        } while (codigoExiste);

        return codigo;
    } catch (err) {
        console.error('Erro ao gerar código único:', err.message);
        throw new Error('Erro ao gerar código único.');
    }
}

// Função auxiliar para salvar o pedido no banco de dados
async function salvarPedido(clienteId, produto, detalhes) {
    try {
        // Gera o código único para o pedido
        const codigo = await gerarCodigoUnico();

        // Insere o pedido no banco de dados
        const query = `
            INSERT INTO pedidos (cliente_id, produto, detalhes, codigo, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(query, [clienteId, produto, JSON.stringify(detalhes), codigo]);

        return { id: result.insertId, clienteId, produto, detalhes, codigo };
    } catch (err) {
        console.error('Erro ao salvar pedido no banco de dados:', err.message);
        throw new Error('Erro ao salvar pedido no banco de dados.');
    }
}

// Rota POST - Criar Pedido
router.post('/', async (req, res) => {
    try {
        const { clienteId, produto, detalhes } = req.body;

        if (!clienteId || !produto || !detalhes) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const pedido = await salvarPedido(clienteId, produto, detalhes);
        res.status(201).json(pedido);
    } catch (err) {
        console.error('Erro ao processar pedido:', err.message);
        res.status(500).json({ error: 'Erro no servidor.', details: err.message });
    }
});

// Rota GET - Listar Pedidos
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                pedidos.id, 
                pedidos.codigo, 
                pedidos.produto, 
                pedidos.detalhes,
                pedidos.created_at, 
                clientes.nome AS cliente_nome, 
                clientes.telefone AS cliente_telefone,
                clientes.endereco AS cliente_endereco 
            FROM pedidos
            JOIN clientes ON pedidos.cliente_id = clientes.id
            ORDER BY pedidos.created_at DESC
        `;

        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar pedidos:', err.message);
        res.status(500).json({ error: 'Erro ao listar pedidos.' });
    }
});

// Rota GET - Gerar Código Único
router.get('/gerar-codigo', async (req, res) => {
    try {
        const codigo = await gerarCodigoUnico();
        res.json({ codigo });
    } catch (err) {
        console.error('Erro ao gerar código único:', err.message);
        res.status(500).json({ error: 'Erro ao gerar código único.' });
    }
});

// Rota PUT - Atualizar Pedido
router.put(
    '/:id',
    [
        body('produto').notEmpty().withMessage('Produto é obrigatório'),
        body('detalhes').notEmpty().withMessage('Detalhes do pedido são obrigatórios'),
    ],
    async (req, res) => {
        const { id } = req.params;
        const { produto, detalhes } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const query = `
                UPDATE pedidos 
                SET produto = ?, detalhes = ? 
                WHERE id = ?
            `;
            const [result] = await db.execute(query, [produto, JSON.stringify(detalhes), id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            res.json({ message: 'Pedido atualizado com sucesso!' });
        } catch (err) {
            console.error('Erro ao atualizar pedido:', err.message);
            res.status(500).json({ error: 'Erro ao atualizar pedido.' });
        }
    }
);

// Rota DELETE - Excluir Pedido
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            DELETE FROM pedidos 
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        res.json({ message: 'Pedido excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir pedido:', err.message);
        res.status(500).json({ error: 'Erro ao excluir pedido.' });
    }
});

module.exports = router;
