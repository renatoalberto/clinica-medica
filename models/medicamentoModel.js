var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicamentoSchema = new Schema (
  {
    nome: String,
    laboratorio: String,
    pricipioAtivo: String,
    apresentacao: String,
    classeTerapeutica: String,
    genericos: [{
      nome: String,
      laboratorio: String
    }]
  }
);

module.exports = mongoose.model('Medicamento', medicamentoSchema);