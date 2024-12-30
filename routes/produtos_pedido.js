const express = require('express');
const db = require('../db');

const router = express.Router();

// Rota para listar os produtos de um pedido
router.get('/', async (req, res) => {
    const { pedido_codigo } = req.query;

    if (!pedido_codigo) {
        return res.status(400).json({ error: 'Código do pedido não fornecido.' });
    }

    try {
        const query = `
            SELECT * 
            FROM produtos_pedido 
            WHERE pedido_codigo = ?
        `;
        const [rows] = await db.execute(query, [pedido_codigo]);

        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err.message);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

router.put('/:pedido_id', async (req, res) => {
    const { pedido_id } = req.params;
    const { envio, status, observacoes, produtos } = req.body;

    try {
        // Atualizar o pedido
        const updatePedidoQuery = `
            UPDATE pedidos 
            SET envio = ?, status = ?, observacoes = ? 
            WHERE codigo = ?
        `;
        await db.execute(updatePedidoQuery, [envio, status, observacoes, pedido_id]);

        // Adicionar novos produtos
        const insertProdutosQuery = `
            INSERT INTO produtos_pedido (pedido_codigo, produto, detalhes) 
            VALUES (?, ?, ?)
        `;

        for (const produto of produtos) {
            await db.execute(insertProdutosQuery, [pedido_id, produto.produto, produto.detalhes]);
        }

        res.json({ message: 'Pedido atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar pedido:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
});

// Rota para excluir um produto pelo ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM produtos_pedido WHERE id = ?`;
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json({ message: 'Produto excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir produto:', err.message);
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
});


module.exports = router;
