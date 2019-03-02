var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pacienteSchema = new Schema (
  {
    nome: String,
    email: String,
    telefone: String,
    atendimentos: [{
      data: Date,
      doutor: String,
      resultado: String,
      medicamentos: [{
        medicamento: String,
      }],
      exames: [{
        exame: String,
        recebido: Boolean,
        entreguePaciente: Boolean
      }]
    }]
  }
);

module.exports = mongoose.model('Paciente', pacienteSchema);