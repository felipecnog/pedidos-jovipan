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

// Rota GET - Listar Pedidos em pedidos.html
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
// Rota GET - Listar Pedidos em detalhes.html
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
router.put('/:pedido_id', async (req, res) => {
    const { pedido_id } = req.params;
    const { envio, status, observacoes, produtos } = req.body;

    try {
        // Atualizar os dados do pedido
        const updatePedidoQuery = `
            UPDATE pedidos 
            SET envio = ?, status = ?, observacoes = ? 
            WHERE codigo = ?
        `;
        await db.execute(updatePedidoQuery, [envio, status, observacoes, pedido_id]);

        // Atualizar ou adicionar produtos
        const insertOrUpdateProdutoQuery = `
            INSERT INTO produtos_pedido (id, pedido_codigo, produto, detalhes)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE produto = VALUES(produto), detalhes = VALUES(detalhes)
        `;
        for (const produto of produtos) {
            const { id, produto: nomeProduto, detalhes } = produto;

            // Garante que o campo detalhes nunca será nulo
            const detalhesCorrigido = detalhes || '';

            await db.execute(insertOrUpdateProdutoQuery, [
                id || null, // ID é nulo para novos produtos
                pedido_id,
                nomeProduto,
                detalhesCorrigido,
            ]);
        }

        res.json({ message: 'Pedido e produtos atualizados com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar pedido e produtos:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar pedido e produtos.' });
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
        res.status(500).json({ error: 'Antes de excluir o pedido, exclua os produtos' });
    }
});

router.delete('/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        // Excluir os produtos associados ao pedido
        const deleteProdutosQuery = `
            DELETE FROM produtos_pedido 
            WHERE pedido_codigo = ?
        `;
        await db.execute(deleteProdutosQuery, [codigo]);

        // Excluir o pedido
        const deletePedidoQuery = `
            DELETE FROM pedidos 
            WHERE codigo = ?
        `;
        const [result] = await db.execute(deletePedidoQuery, [codigo]);

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
