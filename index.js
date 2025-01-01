const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Importando a conexão com o banco de dados

const usuariosRouter = require('./routes/usuarios');
const cadastroRouter = require('./routes/cadastro');
const loginRouter = require('./routes/login');
const clientesRouter = require('./routes/clientes');
const pedidosRouter = require('./routes/pedidos');
const produtosPedidoRouter = require('./routes/produtos_pedido');
const produtosRouter = require('./routes/produtos');  

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

// Middleware para processar JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'components')));

// Rota GET para a raiz (login.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota POST para login
app.post('/login', (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
  }

  // Use a conexão do banco de dados
  db.execute('SELECT * FROM usuarios WHERE nome = ?', [nome])
    .then(([results]) => {
      if (results.length === 0) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      const usuario = results[0];
      bcrypt.compare(senha, usuario.senha).then((isPasswordValid) => {
        if (!isPasswordValid) {
          return res.status(400).json({ error: 'Senha inválida' });
        }

        // Configura a sessão do usuário após login
        req.session.userId = usuario.id;
        req.session.userRole = usuario.categoria;  // Define o papel (administrador ou utilizador)

        res.status(200).json({ message: 'Login bem-sucedido', role: usuario.categoria });
      });
    })
    .catch((err) => {
      console.error('Erro ao acessar o banco de dados:', err);
      res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    });
});

// Rota para verificar o papel do usuário
app.get('/verificar-usuario', (req, res) => {
  if (req.session.userRole) {
      res.status(200).json({ role: req.session.userRole });
  } else {
      res.status(403).json({ error: 'Usuário não autenticado' });
  }
});

// Rota para finalizar a sessão (logout)
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send('Erro ao finalizar a sessão');
      }
      res.redirect('/'); // Redireciona para a página de login após o logout
  });
});

// Rotas
app.use('/usuarios', usuariosRouter);
app.use('/cadastro', cadastroRouter);
app.use('/login', loginRouter);
app.use('/clientes', clientesRouter);
app.use('/pedidos', pedidosRouter);
app.use('/produtos_pedido', produtosPedidoRouter);
app.use('/produtos', produtosRouter);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
