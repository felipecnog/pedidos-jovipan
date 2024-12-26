const express = require('express');
const path = require('path');
const session = require('express-session');
const usuariosRouter = require('./routes/usuarios');
const cadastroRouter = require('./routes/cadastro');
const loginRouter = require('./routes/login');
const clientesRouter = require('./routes/clientes');
const pedidosRouter = require('./routes/pedidos');

const app = express();

// Middleware de sessão
app.use(
  session({
      secret: 'chave-secreta', // Use uma chave segura em produção
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 3600000 }, // 1 hora
  })
);

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/components')));

// Middleware para processar JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Usuarios Router:', usuariosRouter);


// Rota GET para a raiz (retorna login.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rotas
app.use('/usuarios', usuariosRouter);
app.use('/cadastro', cadastroRouter);
app.use('/login', loginRouter);
app.use('/clientes', clientesRouter);
app.use('/pedidos', pedidosRouter);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});