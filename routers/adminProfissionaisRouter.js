var express = require('express');
var profissionaisRouter = express.Router();

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });

var ProfissionalModel = require('../models/profissionalModel');

//Valida se profissional logado e administrador
//Não existe aqui uma referência para app.get('usuario'), mas recebemos ele no req
profissionaisRouter.use('/', function(req, res, next){
  var usuario = req.app.locals.usuarioLogado(req);

  if (!usuario.id || !usuario.nome || !usuario.funcao || usuario.admin != 'true' ) {
    res.redirect('/');
  } else {
    req.app.locals.atualizaCookies(req, res);
    next();
  }

})

profissionaisRouter.get('/', function(req, res) {
  ProfissionalModel.find(null, null, {sort: {nome: 1}}, function(erro, profissionais){
    if(erro) console.error(erro);

    res.render('admin/profissionais', {usuario: req.app.locals.usuarioLogado(req), profissionais: profissionais, mensagem: null})
  })
});

profissionaisRouter.get('/alterar/:id', function(req, res){
  ProfissionalModel.findById(req.params.id, function(erro, profissional){
    if(erro) return console.erro(erro);
    res.render('admin/profissionalalterar', {usuario: req.app.locals.usuarioLogado(req), profissional: profissional, mensagem: null});
  })
});

profissionaisRouter.post('/alterar/:id', urlEncodedParser, function(req, res){
  agenda = [];

  if (req.body.agenda) {
    if (typeof req.body.agenda == 'string') {
      agenda.push({dia: +req.body.agenda})
    } else {
      req.body.agenda.forEach( function(dia){
        agenda.push({dia: +dia})
      });
    }
  }

  var profissional = new ProfissionalModel({
    _id: req.params.id,
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone,
    funcao: req.body.funcao,
    admin: (req.body.admin == 'true'),
    agenda: agenda,
    senha: req.body.senha
  });

  ProfissionalModel.updateOne({_id: profissional._id}, profissional, function(erro){
    if(erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Profissional alterado.'}
    res.render('admin/profissionalalterar', {usuario: req.app.locals.usuarioLogado(req), profissional: profissional, mensagem: mensagem});
  })
})

profissionaisRouter.post('/excluir', urlEncodedParser, function(req, res) {
  ProfissionalModel.deleteOne({_id: req.body.id}, function(erro){
    if (erro) console.error(erro);

    ProfissionalModel.find(null, null, {sort: {nome: 1}}, function(erro, profissionais){
      if(erro) console.error(erro);
  
      var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Profissional excluido.'}
      res.render('admin/profissionais', {usuario: req.app.locals.usuarioLogado(req), profissionais: profissionais, mensagem: mensagem})
    })
  })
})

profissionaisRouter.get('/novo', function(req, res){
  var profissional = {
    nome: '',
    email: '',
    telefone: null,
    admin: false,
    funcao: '',
    agenda: [],
    senha: ''
  }

  res.render('admin/profissionalnovo', {usuario: req.app.locals.usuarioLogado(req), profissional: profissional, mensagem: null});
});

profissionaisRouter.post('/novo', urlEncodedParser, function(req, res) {
  agenda = [];

  if (req.body.agenda) {
    if (typeof req.body.agenda == 'string') {
      agenda.push({dia: +req.body.agenda})
    } else {
      req.body.agenda.forEach( function(dia){
        agenda.push({dia: +dia})
      });
    }
  }

  var profissional = new ProfissionalModel({
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone,
    funcao: req.body.funcao,
    admin: (req.body.admin == 'true'),
    agenda: agenda,
    senha: req.body.senha
  });

  profissional.save(function(erro, profissional){
    if(erro) console.error(erro);

    var profissional = {
      nome: '',
      email: '',
      telefone: null,
      admin: false,
      funcao: '',
      agenda: [],
      senha: ''
    }

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Profissional incluido.'}
    res.render('admin/profissionalnovo', {usuario: req.app.locals.usuarioLogado(req), profissional: profissional, mensagem: mensagem})
  })
})

module.exports = profissionaisRouter;