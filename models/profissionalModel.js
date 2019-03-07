var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var profissionalSchema = new Schema (
  {
    nome: String,
    email: String,
    telefone: String,
    admin: { type: Boolean, default: false },
    funcao: String,
    agenda: [{dia: Number}],
    senha: String
  }
);

module.exports = mongoose.model('Profissional', profissionalSchema);