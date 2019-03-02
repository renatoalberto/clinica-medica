var express = require('express');
var pacienteRouter = express.Router();

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });

var PacienteModel = require('../models/pacienteModel');

//Valida se profissional logado
//Não existe aqui uma referência para app.get('usuario'), mas recebemos ele no req
pacienteRouter.use('/', function(req, res, next){
  var usuario = req.app.locals.usuarioLogado(req);

  if (!usuario.id || !usuario.nome || !usuario.funcao) {
    res.redirect('/');
  } else {
    req.app.locals.atualizaCookies(req, res);
    next();
  }

})

pacienteRouter.get('/', function(req, res) {
  res.render('pacientes/pacientes', {usuario: req.app.locals.usuarioLogado(req), mensagem: null});
});

pacienteRouter.get('/alterar/:id', function(req, res){
  PacienteModel.findById(req.params.id, function(erro, paciente){
    if(erro) return console.erro(erro);
    res.render('pacientes/pacientealterar', {usuario: req.app.locals.usuarioLogado(req), paciente: paciente, mensagem: null});
  })
});

pacienteRouter.post('/alterar/:id', urlEncodedParser, function(req, res){
  var paciente = new PacienteModel({
    _id: req.params.id,
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone,
    atendimentos: []
  });

  PacienteModel.updateOne({_id: paciente._id}, paciente, function(erro){
    if(erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Paciente alterado.'}
    res.render('pacientes/pacientealterar', {usuario: req.app.locals.usuarioLogado(req), paciente: paciente, mensagem: mensagem});
  })
})

pacienteRouter.post('/excluir', urlEncodedParser, function(req, res) {
  PacienteModel.deleteOne({_id: req.body.id}, function(erro){
    if (erro) console.error(erro);

    PacienteModel.find(null, null, {sort: {nome: 1}}, function(erro, pacientes){
      if(erro) console.error(erro);
  
      var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Paciente excluido.'}
      res.render('pacientes/pacientes', {usuario: req.app.locals.usuarioLogado(req), pacientes: pacientes, mensagem: mensagem})
    })
  })
})

pacienteRouter.get('/novo', function(req, res){
  var paciente = {
    nome: '',
    email: '',
    telefone: null,
    atendimento: []
  }

  res.render('pacientes/pacientenovo', {usuario: req.app.locals.usuarioLogado(req), paciente: paciente, mensagem: null});
});

pacienteRouter.post('/novo', urlEncodedParser, function(req, res) {
  var paciente = new PacienteModel({
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone,
    atendimento: []
  });

  paciente.save(function(erro, paciente){
    if(erro) console.error(erro);

    var paciente = {
      nome: '',
      email: '',
      telefone: null,
      atendimento: []
    }

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Paciente incluido.'}
    res.render('pacientes/pacientenovo', {usuario: req.app.locals.usuarioLogado(req), paciente: paciente, mensagem: mensagem})
  })
})

pacienteRouter.get('/api/todos', urlEncodedParser, function(req, res){
  PacienteModel.find(null, null, {sort: {nome: 1}}, function(erro, pacientes){
    if(erro) console.error(erro);

    res.json({pacientes: pacientes})
  })
});

pacienteRouter.delete('/api/excluir', urlEncodedParser, function(req, res){
  PacienteModel.deleteOne({_id: req.body.id}, function(erro){
    if (erro) console.error(erro);

    PacienteModel.find(null, null, {sort: {nome: 1}}, function(erro, pacientes){
      if(erro) console.error(erro);
  
      var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Paciente excluido.'}
      res.json({usuario: req.app.locals.usuarioLogado(req), pacientes: pacientes, mensagem: mensagem})
    })
  })

});

pacienteRouter.post('/api/nome', urlEncodedParser, function(req, res){
  var nome = req.body.nome;

  PacienteModel.find({ nome: {'$regex': nome} }, null, {sort: {nome: 1}}, function(erro, pacientes){
    if(erro) return console.error(erro);
    res.json({pacientes: pacientes});
  })
});

pacienteRouter.post('/api/email', urlEncodedParser, function(req, res){
  var email = req.body.email;

  PacienteModel.find({ email: {'$regex': email} }, null, {sort: {nome: 1}}, function(erro, pacientes){
    if(erro) return console.error(erro);
    res.json({pacientes: pacientes});
  })
});

pacienteRouter.post('/api/telefone', urlEncodedParser, function(req, res){
  var telefone = req.body.telefone;

  PacienteModel.find({ telefone: {'$regex': telefone} }, null, {sort: {nome: 1}}, function(erro, pacientes){
    if(erro) return console.error(erro);
    res.json({pacientes: pacientes});
  })
});

module.exports = pacienteRouter;