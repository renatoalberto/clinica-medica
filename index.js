var express = require('express');
var app = express();
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false}); //útil nos métodos http post

var express = require('express');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var ProfissionalModel = require('./models/profissionalModel');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/clinica', { useNewUrlParser: true });

var moment = require('moment');
moment.locale('pt-br');

//funções locais
app.locals.formataData = function(data) {
  return moment(data).format('L');
}

app.locals.formataDiaSemana = function(data) {
  return moment(data).format('dddd');
}

app.locals.somaData = function(quantidadeDias) {
  return moment().add(quantidadeDias, 'days');
}

app.locals.usuarioLogado = function(req) {
  var usuario = { 
    id: null, 
    nome: '', 
    funcao: '', 
    admin: false 
  };

  if (req.cookies.id && req.cookies.nome && req.cookies.funcao) {
    usuario = { 
      id: req.cookies.id, 
      nome: req.cookies.nome, 
      funcao: req.cookies.funcao, 
      admin: req.cookies.admin 
    };
  }

  return usuario;
}

app.locals.atualizaCookies = function(req, res) {

  if (req.cookies.id && req.cookies.nome && req.cookies.funcao) {
    res.cookie('id', req.cookies.id, { expires: new Date(Date.now() + 600000) });
    res.cookie('nome', req.cookies.nome, { expires: new Date(Date.now() + 600000) });
    res.cookie('funcao', req.cookies.funcao, { expires: new Date(Date.now() + 600000) });
    res.cookie('admin', req.cookies.admin, { expires: new Date(Date.now() + 600000) });
  };

}

// Roteamento público
app.use('/public', express.static('./public'));

// Usuário
//app.set('usuario', { id: null, nome: '', funcao: '', admin: false });
//app.set('usuario', { id: '5c583ae75f526d12ecd1e975', nome: 'Renato Alberto da Silva', funcao: 'Recepcionista', admin: true });

//Roteamentos descendentes
var adminProfissionaisRouter = require('./routers/adminProfissionaisRouter');
app.use('/admin/profissionais', adminProfissionaisRouter);

var pacientesRouter = require('./routers/pacientesRouter');
app.use('/pacientes', pacientesRouter);

var consultasRouter = require('./routers/consultasRouter');
app.use('/consultas', consultasRouter);

var atendimentoRouter = require('./routers/atendimentoRouter');
app.use('/atendimento', atendimentoRouter);

var medicamentoRouter = require('./routers/medicamentos.Router');
app.use('/medicamentos', medicamentoRouter);

//Roteamentos
app.get('/', function(req, res){
  res.render('principal', {usuario: app.locals.usuarioLogado(req), filtro: null, profissionais: [], pagina: 1, mensagem: null});
});

app.get('/login', function(req, res) {
  res.render('login', {usuario: app.locals.usuarioLogado(req), mensagem: null});
});

app.post('/login', urlEncodedParser, function(req, res) {
  ProfissionalModel.findOne({email: req.body.email}, function(erro, profissional){
    if (erro) console.error(erro);

    if (profissional && profissional.senha == req.body.senha) {
      res.cookie('id', profissional._id, { expires: new Date(Date.now() + 600000) });
      res.cookie('nome', profissional.nome, { expires: new Date(Date.now() + 600000) });
      res.cookie('funcao', profissional.funcao, { expires: new Date(Date.now() + 600000) });
      res.cookie('admin', profissional.admin, { expires: new Date(Date.now() + 600000) });

      res.redirect('/');
    } else {
      var mensagem = {tipo: 4, erro: 'Login inváligo!', texto: 'Informe email e senha novamente.'};
      res.render('login', {usuario: app.locals.usuarioLogado(req), mensagem: mensagem});
    };
  });
});

app.get('/logout', function(req, res){
  res.clearCookie('id');
  res.clearCookie('nome');
  res.clearCookie('funcao');
  res.clearCookie('admin');

  res.redirect('/');
});

app.listen(port, function(){
  console.log('App listen on port '+ port);
});