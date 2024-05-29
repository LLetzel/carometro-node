// importando das biblioteca
const express = require('express'); // biblioteca 
const mysql = require('mysql2'); // Conectar com o banco de dados
const cors = require('cors'); // trabalhar com API
const bodyParser = require('body-parser'); //pegar requisição do corpo do html
const session = require('express-session'); // sessão para login
const bcrypt = require('bcrypt'); // fazer a criptografia da senha 
require('dotenv').config(); // arquivos de configuração

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // para pegar o corpo do html

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(error => {
    if (error) {
        console.error(
            'Erros ao conectar com banco de dados', err)
        return;
    }
    console.log('Conectado ao banco de dados')
}
);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const authenticateSession = (req, res, next) => {
    if (!req.session.userID) {
        return res.status(401).send('Acesso negado, faça login para continuar!')
    }
    next();
}

app.post('/login', (req, res) =>{
    const { cpf, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE cpf = ? AND senha = ?', [cpf], // query para verificar se o cpf existe no banco de dados
    async (err, results) => {
        if(err) return res.status(500).send('Server com erro');
        if(results.length === 0) {
            return res.status(500).send('CPF ou senha incorretos');

            const usuario = results[0];
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
                if(!senhaCorreta) return res.status(500).send(
                    'CPF ou senha incorretos');

                 req.session.userID = usuario.idUsuarios;
                 console.log('idUsuarios:', usuario.idUsuarios);
                 res.json({ message: 'Login bem-sucedido!'});
            }
    }) 



})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
}
);

