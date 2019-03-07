var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pacienteSchema = new Schema (
  {
    nome: String,
    email: String,
    telefone: String
  }
);

module.exports = mongoose.model('Paciente', pacienteSchema);