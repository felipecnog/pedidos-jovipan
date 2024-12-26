const express = require('express');
const bcrypt = require('bcryptjs');
const appModel = require('../models/app');
const router = express.Router();

// Rota de login
router.post('/', async (req, res) => {
    const { nome, senha } = req.body;

    try {
        const usuario = await appModel.getUserByName(nome);
        if (!usuario) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        //const senhaCorreta = await appModel.compararSenha(senha, usuario.senha);
        //if (!senhaCorreta) {
        //    return res.status(400).json({ message: 'Senha incorreta.' });
        //}

        // Compara a senha fornecida com o hash armazenado
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ error: 'Senha incorreta' });
        }

        // Armazena as informações do usuário na sessão
        //req.session.usuario = { id: usuario.id, nome: usuario.nome, categoria: usuario.categoria };
        //res.status(200).json({ message: 'Login bem-sucedido.' });
    //} catch (err) {
        //console.error(err);
        //res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
    //}
        // Autenticação bem-sucedida, retorne um token ou mensagem
        res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (err) {
        console.error('Erro ao realizar login:', err.message);
        res.status(500).json({ error: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota de logout
//router.post('/logout', (req, res) => {
//    req.session.destroy((err) => {
//        if (err) {
//            return res.status(500).json({ message: 'Erro ao fazer logout.' });
//        }
//        res.status(200).json({ message: 'Logout bem-sucedido.' });
//    });
//});

module.exports = router;
