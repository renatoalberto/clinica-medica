var express = require('express');
var medicamentosRouter = express.Router();

var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });

var MedicamentoModel = require('../models/medicamentoModel');

//Valida se profissional logado
//Não existe aqui uma referência para app.get('usuario'), mas recebemos ele no req
medicamentosRouter.use('/', function(req, res, next){
  var usuario = req.app.locals.usuarioLogado(req);

  if (!usuario.id || !usuario.nome || !usuario.funcao || ( usuario.funcao != 'Médico' && usuario.admin != 'true')) {
    res.redirect('/');
  } else {
    req.app.locals.atualizaCookies(req, res);
    next();
  }
  
});

medicamentosRouter.get('/', function(req, res) {
  res.render('medicamento/medicamentos', {usuario: req.app.locals.usuarioLogado(req), mensagem: null});
});

medicamentosRouter.get('/novo', function(req, res) {
  var medicamento = new MedicamentoModel({
    nome: '',
    laboratorio: '',
    pricipioAtivo: '',
    apresentacao: '',
    classeTerapeutica: '',
    genericos: []
  });

  res.render('medicamento/medicamentonovo', {usuario: req.app.locals.usuarioLogado(req), medicamento: medicamento, mensagem: null});
});

medicamentosRouter.post('/novo', urlEncodedParser, function(req, res) {
  var genericos = [];

  if (req.body.listaNomeGenerico) {
    req.body.listaNomeGenerico.forEach(function(nome, index){
      genericos.push({nome: nome, laboratorio: req.body.listaLaboratorioGenerico[index]});
    });
  }

  var medicamento = new MedicamentoModel({
    nome: req.body.nome.toUpperCase(),
    laboratorio: req.body.laboratorio.toUpperCase(),
    pricipioAtivo: req.body.pricipioAtivo.toUpperCase(),
    apresentacao: req.body.apresentacao.toUpperCase(),
    classeTerapeutica: req.body.classeTerapeutica.toUpperCase(),
    genericos: genericos
  });

  medicamento.save(function(erro){
    if(erro) console.error(erro);    

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Medicamentos incluidos.'}
    res.render('medicamento/medicamentonovo', {usuario: req.app.locals.usuarioLogado(req), medicamento: medicamento, mensagem: mensagem});
  });

});

medicamentosRouter.get('/alterar/:id', function(req, res){
  MedicamentoModel.findById(req.params.id, function(erro, medicamento){
    if(erro) return console.erro(erro);
    res.render('medicamento/medicamentoalterar', {usuario: req.app.locals.usuarioLogado(req), medicamento: medicamento, mensagem: null});
  })
});

medicamentosRouter.post('/alterar/:id', urlEncodedParser, function(req, res){
  var genericos = [];

  if (req.body.listaNomeGenerico) {
    req.body.listaNomeGenerico.forEach(function(nome, index){
      genericos.push({nome: nome, laboratorio: req.body.listaLaboratorioGenerico[index]});
    });
  }

  var medicamento = new MedicamentoModel({
    _id: req.params.id,
    nome: req.body.nome,
    laboratorio: req.body.laboratorio,
    pricipioAtivo: req.body.pricipioAtivo,
    apresentacao: req.body.apresentacao,
    classeTerapeutica: req.body.classeTerapeutica,
    genericos: genericos
  });

  MedicamentoModel.updateOne({_id: req.params.id}, medicamento, function(erro){
    if(erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Medicamento alterado.'}
    res.render('medicamento/medicamentoalterar', {usuario: req.app.locals.usuarioLogado(req), medicamento: medicamento, mensagem: mensagem});
  })
});


medicamentosRouter.delete('/api/excluir', urlEncodedParser, function(req, res){
  MedicamentoModel.deleteOne({_id: req.body.id}, function(erro) {
    if(erro) console.error(erro);

    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Medicamento excluido.'}
    res.json({mensagem: mensagem})
  })
});

medicamentosRouter.post('/api/paginacao', urlEncodedParser, function(req, res){
  var nome         = req.body.nome.toUpperCase();
  var apresentacao = req.body.apresentacao.toUpperCase();

  var quantidade   = req.body.qtPorPagina;
  var pagAtual     = req.body.paginaAtual;
  var pular        = (pagAtual * quantidade) - quantidade;

  var temMais      = false;

  ++quantidade;

  MedicamentoModel.find({ nome: {'$regex': nome}, apresentacao: {'$regex': apresentacao} }, null, {limit: quantidade, skip: pular}, function(erro, medicamentos){
    if(erro) return console.error(erro);

    if (medicamentos.length > req.body.qtPorPagina) {
      medicamentos.pop();
      temMais = true;
    };

    res.json({medicamentos: medicamentos, temMais: temMais});
  });
});

medicamentosRouter.post('/api/carregamedicamentos', urlEncodedParser, function(req, res) {
  var medicamentoAnt = {};
  var dados = req.body.medicamentos;

  var medicamentos = JSON.parse(dados);

  medicamentos.forEach(function(m){

    m['PRINCIPIO ATIVO'] = m['PRINCIPIO ATIVO'].replace(/;/g,"; "); //colocar espaço após ;
    m.PRODUTO            = m.PRODUTO.replace(/\u002B/g," + ");      //colocar espaço após +
    m.PRODUTO            = m.PRODUTO.replace(/  \u002B  /g," \u002B ");  //retira excesso de espaço

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

medicamentosRouter.delete('/api/excluitodos', function(req, res){
  MedicamentoModel.deleteMany({}, function(erro) {
    var mensagem = {tipo: 2, erro: 'Sucesso!', texto: 'Medicamentos excluidos.'}
    res.json({mensagem: mensagem})
  })
});

module.exports = medicamentosRouter;