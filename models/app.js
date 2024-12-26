const bcrypt = require('bcrypt');
const db = require('../db');

const getUserByName = async (nome) => {
    const query = 'SELECT * FROM usuarios WHERE nome = ?';
    const [results] = await db.execute(query, [nome]);
    return results[0];  // Retorna o primeiro registro encontrado
};

const hashSenha = async (senha) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
};

const compararSenha = async (senha, hashedPassword) => {
    return bcrypt.compare(senha, hashedPassword);
};

//const addUsuario = async (nome, senha, categoria, status = 'ativo') => {
//    const hashedSenha = await hashSenha(senha);
//    const query = 'INSERT INTO usuarios (nome, senha, categoria, status) VALUES (?, ?, ?, ?)';
//    const [result] = await db.execute(query, [nome, hashedSenha, categoria, status]);
//    return result;
//};
const addUsuario = async (nome, senha, categoria, status = 'ativo') => {
    const hashedSenha = await bcrypt.hash(senha, 10); // Criptografa a senha
    const query = 'INSERT INTO usuarios (nome, senha, categoria, status) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [nome, hashedSenha, categoria, status]);
    return result;
};

const getAllUsuarios = async () => {
    const query = 'SELECT id, nome, categoria, status FROM usuarios';
    const [rows] = await db.execute(query);
    return rows;
};
// Função para deletar um usuário pelo ID
const deleteUsuario = async (id) => {
    try {
        const query = 'DELETE FROM usuarios WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        return result; // Retorna o resultado da operação
    } catch (err) {
        throw new Error('Erro ao deletar o usuário: ' + err.message);
    }
};
// Adiciona um novo cliente
const addCliente = async (nome, telefone, endereco) => {
    const query = 'INSERT INTO clientes (nome, telefone, endereco) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [nome, telefone, endereco]);
    return result;
};

// Lista todos os clientes
const getAllClientes = async () => {
    const query = 'SELECT * FROM clientes';
    const [results] = await db.execute(query);
    return results;
};

// Exclui um cliente pelo ID
const deleteCliente = async (id) => {
    const query = 'DELETE FROM clientes WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
};

// Atualiza um cliente pelo ID
const updateCliente = async (id, nome, telefone, endereco) => {
    const query = 'UPDATE clientes SET nome = ?, telefone = ?, endereco = ? WHERE id = ?';
    const [result] = await db.execute(query, [nome, telefone, endereco, id]);
    return result;
};

module.exports = {
    getUserByName,
    hashSenha,
    compararSenha,
    addUsuario,
    getAllUsuarios,
    deleteUsuario,
    addCliente,
    getAllClientes,
    deleteCliente,
    updateCliente,
};
