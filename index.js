const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Conexão com o banco de dados MariaDB
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Substitua com seu usuário
    password: '2509', // Substitua com sua senha
    database: 'xsw_jovipan' // Substitua com seu banco de dados
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    } else {
        console.log('Conexão com banco de dados estabelecida!');
    }
});

// Configuração para servir arquivos estáticos (HTML, CSS, JS) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para permitir que o servidor entenda JSON no corpo das requisições (POST)
app.use(express.json());

// Rota GET para a página inicial
app.get('/', (req, res) => {
    res.send('Servidor funcionando!');
});

// Rota GET para retornar a lista de usuários do banco de dados
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            console.error('Erro ao consultar usuários:', err);
            res.status(500).json({ error: 'Erro ao consultar usuários' });
        } else {
            res.json(results);
        }
    });
});

// Rota POST para criar um novo usuário
app.post('/usuarios', (req, res) => {
    const { nome } = req.body; // Supondo que o nome seja enviado no corpo da requisição
    if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    db.query('INSERT INTO usuarios (nome) VALUES (?)', [nome], (err, results) => {
        if (err) {
            console.error('Erro ao inserir usuário:', err);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
        res.status(201).json({ message: 'Usuário criado com sucesso', id: results.insertId });
    });
});

// Rota PUT para editar um usuário
app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    db.query('UPDATE usuarios SET nome = ? WHERE id = ?', [nome, id], (err, results) => {
        if (err) {
            console.error('Erro ao editar usuário:', err);
            return res.status(500).json({ error: 'Erro ao editar usuário' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário atualizado com sucesso' });
    });
});

// Rota DELETE para excluir um usuário
app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            return res.status(500).json({ error: 'Erro ao excluir usuário' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    });
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
