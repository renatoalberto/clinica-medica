var express = require('express');
var consultaRouter = express.Router();

var moment = require('moment');

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });

var mongoose = require('mongoose'); 

var ProfissionalModel = require('../models/profissionalModel');
var ConsultaModel     = require('../models/consultaModel');

// Trata horários disponíveis para consulta
var hora = moment("800", "hmm");
var lista = [];

for (let i = 0; i < 20; i++) {
  lista.push({hora: hora.format("HH:mm"), item: i+1});
  hora.add(30, 'm');
}

//Valida se profissional logado
//Não existe aqui uma referência para app.get('usuario'), mas recebemos ele no req
consultaRouter.use('/', function(req, res, next){
  var usuario = req.app.locals.usuarioLogado(req);

  if (!usuario.id || !usuario.nome || !usuario.funcao) {
    res.redirect('/');
  } else {
    req.app.locals.atualizaCookies(req, res);
    next();
  }
  
})

consultaRouter.get('/', function(req, res) {

  ProfissionalModel.find({funcao: 'Médico'}, '_id nome agenda', {sort: {nome: 1}}, function(erro, medicos){
    if(erro) console.error(erro);

    dataInicioPesq = moment();
    
    var dias = listaDias(medicos[0].agenda, dataInicioPesq);
    res.render('consultas/consultas', {usuario: req.app.locals.usuarioLogado(req), medicos: medicos, dias: dias, lista: lista, mensagem: null});
  })

});

function listaDias(agenda, dataInicioPesq) {
  var dias = [];
  var item = 0;

  for (let i = 0; dias.length < 7; i++) {
    for (let j = 0; j < agenda.length; j++) {
      if (agenda[j].dia == dataInicioPesq.format('e')) {
        dias.push({data: dataInicioPesq.format("L"), semana: dataInicioPesq.format("dddd"), item: ++item});
      }
    }  
    dataInicioPesq.add(1,"day");
  }

  return dias;
}

consultaRouter.post('/api/nova-consulta', urlEncodedParser, function(req, res){
  consulta = new ConsultaModel({
    medico: {
      id: req.body.medicoId,
      nome: req.body.medicoNome
    },
    paciente: {
      id: req.body.pacienteId,
      nome: req.body.pacienteNome,
      telefone: req.body.pacienteTelefone
    },
    data: req.body.data,
    hora: req.body.hora,
    horaItem: req.body.horaItem,
    confirmacao: false,
    cafezinho: false
  });

  consulta.save(function(erro, consulta){
    if(erro) console.error(erro);
    res.json({consulta: consulta})
  })
});

consultaRouter.post('/api/consultas-marcadas', urlEncodedParser, function(req, res){  
  var id = new mongoose.Types.ObjectId(req.body.medicoId);
  
  ConsultaModel.find({medico: {id: id, nome: req.body.medicoNome}, data: req.body.data}, function(erro, consultas){
    if(erro) return console.error(erro);
    res.json({consultas: consultas});
  });
});

consultaRouter.post('/api/paciente', urlEncodedParser, function(req, res){
  var paciente = {
    id: new mongoose.Types.ObjectId(req.body.pacienteId),
    nome: req.body.pacienteNome,
    telefone: req.body.pacienteTelefone
  };

  ConsultaModel.find({paciente: paciente}, function(erro, consultas){
    if (erro) return console.error(erro);

    var consultasFuturas = [];
    var ontem = moment().subtract(1, 'day');

    consultas.forEach( consulta => {
      if (ontem.isBefore(moment(consulta.data, "DD-MM-YYYY"))) {
        consultasFuturas.push(consulta);
      };
    });

    res.json({consultas: consultasFuturas});
  })
})

consultaRouter.delete('/api/exclui-consulta', urlEncodedParser, function(req, res){
  ConsultaModel.deleteOne({_id: req.body.id}, function(erro, paciente){
    if (erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Paciente excluido.'}
    res.json({paciente: paciente});
  })
});

consultaRouter.post('/api/confirma-consulta', urlEncodedParser, function(req, res){
  ConsultaModel.findById(req.body.id, function(erro, consulta){
    if(erro) return console.erro(erro);

    consulta.confirmacao = true;

    ConsultaModel.updateOne({_id: req.body.id}, consulta, function(erro){
      if(erro) return console.erro(erro);
      res.json({consulta: consulta});
    });
  })
});

consultaRouter.post('/api/cafezinho-consulta', urlEncodedParser, function(req, res){
  ConsultaModel.findById(req.body.id, function(erro, consulta){
    if(erro) return console.erro(erro);

    if (consulta) {
      if (consulta.cafezinho) {
        consulta.cafezinho = false;
      } else {
        consulta.cafezinho = true;
      };

      if (consulta.paciente.nome) {
        ConsultaModel.updateOne({_id: req.body.id}, consulta, function(erro){
          if(erro) return console.erro(erro);
          res.json({consulta: consulta}); 
        });
      } else {
        ConsultaModel.deleteOne({_id: req.body.id}, function(erro, paciente){
          if (erro) console.error(erro);      
          res.json({paciente: paciente});
        })
      }

    } else {
      consulta = new ConsultaModel({
        medico: {
          id: req.body.medicoId,
          nome: req.body.medicoNome
        },
        data: req.body.data,
        hora: req.body.hora,
        horaItem: req.body.horaItem,
        cafezinho: true
      });
    
      consulta.save(function(erro, consulta){
        if(erro) console.error(erro);
        res.json({consulta: consulta})
      })
    }

  })
});

consultaRouter.post('/api/agenda-doutor', urlEncodedParser, function(req, res){
  
  ProfissionalModel.findById(req.body.medicoId, 'agenda', function(erro, agenda){
    if(erro) console.error(erro);   

    var dataInicioPesq;

    if (req.body.data) {
      dataInicioPesq = moment(req.body.data, "DD-MM-YYYY");

      if (req.body.proximaPagina) {
        dataInicioPesq.add(1,"day");
      };

    } else {
      dataInicioPesq = moment();
    }
    
    var dias = listaDias(agenda.agenda, dataInicioPesq);
    res.json({dias: dias});
  });

});

module.exports = consultaRouter;