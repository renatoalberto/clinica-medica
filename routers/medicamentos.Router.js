var express = require('express');
var medicamentosRouter = express.Router();

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });

var MedicamentoModel = require('../models/medicamentoModel');

//Valida se profissional logado
//Não existe aqui uma referência para app.get('usuario'), mas recebemos ele no req
medicamentosRouter.use('/', function(req, res, next){
  var usuario = req.app.locals.usuarioLogado(req);

  if (!usuario.id || !usuario.nome || !usuario.funcao) {
    res.redirect('/');
  } else {
    req.app.locals.atualizaCookies(req, res);
    next();
  }
  
})

medicamentosRouter.post('/api/inicio', urlEncodedParser, function(req, res){
  var quantidade = req.body.qtPorPagina;
  ++quantidade;
  
  MedicamentoModel.find(null, null, {limit: quantidade}, function(erro, medicamentos){
    if(erro) return console.error(erro);
    res.json({medicamentos: medicamentos});
  });

})

medicamentosRouter.post('/api/paginacao', urlEncodedParser, function(req, res){
  var nome         = req.body.nome.toUpperCase();
  var apresentacao = req.body.apresentacao.toUpperCase();

  var quantidade = req.body.qtPorPagina;
  var pagAtual   = req.body.paginaAtual;
  var pular      = (pagAtual * quantidade) - quantidade;

  ++quantidade;
  
  MedicamentoModel.find({ nome: {'$regex': nome}, apresentacao: {'$regex': apresentacao} }, null, {limit: quantidade, skip: pular}, function(erro, medicamentos){
    if(erro) return console.error(erro);
    res.json({medicamentos: medicamentos});
  });

})

medicamentosRouter.post('/api/carregamedicamentos', urlEncodedParser, function(req, res) {
  var medicamentoAnt = {};
  var dados = req.body.medicamentos;

  var medicamentos = JSON.parse(dados);

  medicamentos.forEach(function(m){

    var medicamento = new MedicamentoModel({
      nome: m.PRODUTO,
      laboratorio: m.LABORATORIO,
      pricipioAtivo: m['PRINCIPIO ATIVO'],
      apresentacao: m.APRESENTACAO,
      classeTerapeutica: m['CLASSE TERAPEUTICA'],
      genericos: []
    });

    if (medicamento != medicamentoAnt) {
      medicamento.save(function(erro){
        if(erro) console.error(erro);    
      })
    }
    
    medicamentoAnt = medicamento;
  });
  
  var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Medicamentos incluidos.'}
  res.json({mensagem: mensagem})
})

module.exports = medicamentosRouter;