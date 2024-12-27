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
async function salvarPedido(clienteId, envio, observacoes) {
    try {
        // Gera o código único para o pedido
        const codigo = await gerarCodigoUnico();

        // Insere o pedido no banco de dados
        const query = `
            INSERT INTO pedidos (cliente_id, envio, observacoes, codigo, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(query, [clienteId, envio, observacoes, codigo]);

        return { id: result.insertId, clienteId, envio, observacoes, codigo };
    } catch (err) {
        console.error('Erro ao salvar pedido no banco de dados:', err.message);
        throw new Error('Erro ao salvar pedido no banco de dados.');
    }
}

// Rota POST - Criar Pedido
router.post('/', async (req, res) => {
    try {
        const { clienteId, envio, observacoes } = req.body;

        if (!clienteId || !envio) {
            return res.status(400).json({ error: 'Os campos cliente e envio são obrigatórios.' });
        }

        const pedido = await salvarPedido(clienteId, envio, observacoes || null);
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
                pedidos.envio, 
                pedidos.observacoes,
                pedidos.created_at, 
                pedidos.status,
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

router.get('/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const query = `
            SELECT 
                pedidos.codigo,
                pedidos.envio,
                pedidos.observacoes,
                pedidos.status,
                pedidos.created_at,
                clientes.nome AS cliente_nome,
                clientes.telefone AS cliente_telefone,
                clientes.endereco AS cliente_endereco
            FROM pedidos
            JOIN clientes ON pedidos.cliente_id = clientes.id
            WHERE pedidos.codigo = ?;
        `;
        const [rows] = await db.execute(query, [codigo]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar pedido:', err.message);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
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
        body('envio').notEmpty().withMessage('Envio é obrigatório'),
        body('observacoes').optional(),
    ],
    async (req, res) => {
        const { id } = req.params;
        const { envio, observacoes } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const query = `
                UPDATE pedidos 
                SET envio = ?, observacoes = ? 
                WHERE id = ?
            `;
            const [result] = await db.execute(query, [envio, observacoes, id]);

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
router.put('/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { envio, observacoes, status, produtos } = req.body;

    try {
        const query = `
            UPDATE pedidos 
            SET envio = ?, observacoes = ?, status = ?
            WHERE codigo = ?
        `;
        await db.execute(query, [envio, observacoes, status, codigo]);

        // Atualizar ou inserir os produtos associados
        const deleteProdutosQuery = `DELETE FROM produtos_pedido WHERE pedido_codigo = ?`;
        await db.execute(deleteProdutosQuery, [codigo]);

        const insertProdutosQuery = `
            INSERT INTO produtos_pedido (pedido_codigo, produto, detalhes) 
            VALUES (?, ?, ?)
        `;
        for (const produto of produtos) {
            await db.execute(insertProdutosQuery, [codigo, produto.produto, produto.detalhes]);
        }

        res.json({ message: 'Pedido atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar pedido:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
});
router.put('/:pedido_id', async (req, res) => {
    const { pedido_id } = req.params;
    const { envio, status, observacoes, produtos } = req.body;

    try {
        // Atualizar pedido
        const updatePedidoQuery = `
            UPDATE pedidos 
            SET envio = ?, status = ?, observacoes = ? 
            WHERE id = ?
        `;
        await db.execute(updatePedidoQuery, [envio, status, observacoes, pedido_id]);

        // Remover produtos antigos
        const deleteProdutosQuery = `DELETE FROM produtos_pedido WHERE pedido_id = ?`;
        await db.execute(deleteProdutosQuery, [pedido_id]);

        // Adicionar novos produtos
        const insertProdutosQuery = `
            INSERT INTO produtos_pedido (pedido_id, produto, detalhes) 
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
