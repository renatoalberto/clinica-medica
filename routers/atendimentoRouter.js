var express = require('express');
var atendimentoRouter = express.Router();

var moment = require('moment');

var bodyParser = require('body-parser');
var  urlEncodedParser = bodyParser.urlencoded({ extended: false });

var mongoose = require('mongoose');

var AtendimentoModel = require('../models/atendimentoModel');

//Valida se profissional logado e médico
atendimentoRouter.use('/', function(req, res, next){
  var usuario = req.app.locals.usuarioLogado(req);

  if (!usuario.id || !usuario.nome || !usuario.funcao || ( usuario.funcao != 'Médico' && usuario.admin != 'true')) {
    res.redirect('/');
  } else {
    req.app.locals.atualizaCookies(req, res);
    next();
  }
    
});

atendimentoRouter.get('/', function(req, res) {
  res.render('atendimento/atendimento', {usuario: req.app.locals.usuarioLogado(req), mensagem: null});
});

atendimentoRouter.get('/api/horario', function(req, res){
  var data = moment().format("L");
  var hora = moment().format("HH:mm");

  res.json({data: data, hora: hora});
})

atendimentoRouter.get('/api/historico/:id/:nome', function(req, res){
  var paciente = {
    _id: new mongoose.Types.ObjectId(req.params.id),
    nome: req.params.nome
  };

  AtendimentoModel.find({paciente: paciente}, '_id data hora medico', function(erro, atendimentos){
    if (erro) console.error(erro);
    res.json({atendimentos: atendimentos});
  });

});

atendimentoRouter.get('/api/historico/:id', function(req, res){

  AtendimentoModel.findById(req.params.id, function(erro, atendimento){
    if (erro) console.error(erro);
    res.json({atendimento: atendimento});
  });

});

atendimentoRouter.get('/api/exclui/:id', function(req, res){

  AtendimentoModel.deleteOne({_id: req.params.id}, function(erro){
    if (erro) console.error(erro); 
    
    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Atendimento excluido.'};
    res.json({mensagem: mensagem});
  })

});

atendimentoRouter.post('/api/gravaatendimento', urlEncodedParser, function(req, res){

  var medicamentos = [];

  for (var i=0; req.body['medicamentos['+i+'][id]']; i++) {
    medicamento = {
      medicamentoId:     req.body['medicamentos['+i+'][id]'],
      nome:              req.body['medicamentos['+i+'][nome]'],
      laboratorio:       req.body['medicamentos['+i+'][laboratorio]'],
      pricipioAtivo:     req.body['medicamentos['+i+'][pricipioAtivo]'],
      apresentacao:      req.body['medicamentos['+i+'][apresentacao]'],
      classeTerapeutica: req.body['medicamentos['+i+'][classeTerapeutica]'],
      genericos: []
    };

    medicamentos.push(medicamento);
  };

  var exames = [];

  for (var i=0; req.body['exames['+i+'][nome]']; i++) {
    exame = {
      nome:                  req.body['exames['+i+'][nome]'],
      exameRecebido:         req.body['exames['+i+'][exameRecebido]'],
      exameEntreguePaciente: req.body['exames['+i+'][exameEntreguePaciente]']
    };

    exames.push(exame);
  };

  var atendimento = new AtendimentoModel ({
    medico: {
      _id: req.app.locals.usuarioLogado(req).id,
      nome: req.app.locals.usuarioLogado(req).nome
    },
    paciente: {
      _id: req.body.pacienteId,
      nome: req.body.pacienteNome
    },
    data: req.body.data,
    hora: req.body.hora,
    queixa: req.body.queixa,
    diagnostico: req.body.diagnostico,
    medicamentos: medicamentos,
    exames: exames
  });

  atendimento.save(function(erro, atend){
    if(erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Atendimento gravado.'}
    res.json({atendimento: atend, mensagem: mensagem})
  });

});

atendimentoRouter.post('/api/gravaatendimento/:id', urlEncodedParser, function(req, res){

  var medicamentos = [];

  for (var i=0; req.body['medicamentos['+i+'][id]']; i++) {
    medicamento = {
      medicamentoId:     req.body['medicamentos['+i+'][id]'],
      nome:              req.body['medicamentos['+i+'][nome]'],
      laboratorio:       req.body['medicamentos['+i+'][laboratorio]'],
      pricipioAtivo:     req.body['medicamentos['+i+'][pricipioAtivo]'],
      apresentacao:      req.body['medicamentos['+i+'][apresentacao]'],
      classeTerapeutica: req.body['medicamentos['+i+'][classeTerapeutica]'],
      genericos: []
    };

    medicamentos.push(medicamento);
  };

  var exames = [];

  for (var i=0; req.body['exames['+i+'][nome]']; i++) {
    exame = {
      nome:                  req.body['exames['+i+'][nome]'],
      exameRecebido:         req.body['exames['+i+'][exameRecebido]'],
      exameEntreguePaciente: req.body['exames['+i+'][exameEntreguePaciente]']
    };

    exames.push(exame);
  };

  var atendimento = new AtendimentoModel ({
    _id: req.params.id,
    medico: {
      _id: req.app.locals.usuarioLogado(req).id,
      nome: req.app.locals.usuarioLogado(req).nome
    },
    paciente: {
      _id: req.body.pacienteId,
      nome: req.body.pacienteNome
    },
    data: req.body.data,
    hora: req.body.hora,
    queixa: req.body.queixa,
    diagnostico: req.body.diagnostico,
    medicamentos: medicamentos,
    exames: exames
  });

  AtendimentoModel.updateOne({_id: req.params.id}, atendimento, function(erro, atend){
    if(erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Atendimento gravado.'}
    res.json({atendimento: atend, mensagem: mensagem})
  });

})


module.exports = atendimentoRouter;