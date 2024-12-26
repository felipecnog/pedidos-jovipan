const jwt = require('jsonwebtoken');

// Middleware para verificar a autenticação JWT
function verificarAutenticacao(req, res, next) {
    const token = req.header('Authorization'); // O token deve ser enviado no cabeçalho Authorization
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Faça login para continuar.' });
    }

    try {
        const decoded = jwt.verify(token, 'chave-secreta-jwt'); // Substitua pela sua chave secreta
        req.user = decoded; // Decodifica o token e armazena as informações do usuário na requisição
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token inválido' });
    }
}

module.exports = { verificarAutenticacao };
