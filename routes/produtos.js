const express = require('express');
const db = require('../db');

const router = express.Router();

// Rota para listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const query = `SELECT * FROM produtos`;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar produtos:', err.message);
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM produtos WHERE id = ?';
        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json(rows[0]); // Retorna o primeiro produto encontrado
    } catch (err) {
        console.error('Erro ao buscar produto:', err.message);
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
});


// Rota para criar um novo produto
router.post('/', async (req, res) => {
    const { nome, variacoes } = req.body;
    try {
        const query = `INSERT INTO produtos (nome, variacoes) VALUES (?, ?)`;
        const [result] = await db.execute(query, [nome, JSON.stringify(variacoes)]);
        res.status(201).json({ id: result.insertId, nome, variacoes });
    } catch (err) {
        console.error('Erro ao criar produto:', err.message);
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, variacoes } = req.body;

    try {
        // Atualizar nome do produto
        const updateProdutoQuery = 'UPDATE produtos SET nome = ? WHERE id = ?';
        await db.execute(updateProdutoQuery, [nome, id]);

        // Atualizar as variações
        const updateVariacoesQuery = 'UPDATE produtos SET variacoes = ? WHERE id = ?';
        await db.execute(updateVariacoesQuery, [JSON.stringify(variacoes), id]);

        res.json({ message: 'Produto atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar produto:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
});



// Rota para excluir um produto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteQuery = `DELETE FROM produtos WHERE id = ?`;
        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json({ message: 'Produto excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir produto:', err.message);
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
});

// Rota para listar variações de um produto
router.get('/variacoes', async (req, res) => {
    const { produto_id } = req.query;

    if (!produto_id) {
        return res.status(400).json({ error: 'O ID do produto é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM variacoes WHERE produto_id = ? ORDER BY created_at DESC';
        const [variacoes] = await db.execute(query, [produto_id]);
        res.json(variacoes);
    } catch (err) {
        console.error('Erro ao listar variações:', err.message);
        res.status(500).json({ error: 'Erro ao listar variações.' });
    }
});

// Rota para adicionar uma nova variação
router.post('/variacoes', async (req, res) => {
    const { produto_id, variacao } = req.body;

    if (!produto_id || !variacao) {
        return res.status(400).json({ error: 'Produto e nome da variação são obrigatórios.' });
    }

    try {
        const query = 'INSERT INTO variacoes (produto_id, variacao) VALUES (?, ?)';
        await db.execute(query, [produto_id, variacao]);
        res.json({ message: 'Variação adicionada com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar variação:', err.message);
        res.status(500).json({ error: 'Erro ao adicionar variação.' });
    }
});

// Rota para excluir uma variação
router.delete('/variacoes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM variacoes WHERE id = ?';
        await db.execute(query, [id]);
        res.json({ message: 'Variação excluída com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir variação:', err.message);
        res.status(500).json({ error: 'Erro ao excluir variação.' });
    }
});

module.exports = router;
