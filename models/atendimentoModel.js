var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var atendimentoSchema = new Schema (
  {
    medico: {
      _id: Schema.Types.ObjectId,
      nome: String
    },

    paciente: {
      _id: Schema.Types.ObjectId,
      nome: String
    },

    data: String,
    hora: String,
    
    queixa: String,
    diagnostico: String,

    medicamentos: [{
      medicamentoId: Schema.Types.ObjectId,
      nome: String,
      laboratorio: String,
      pricipioAtivo: String,
      apresentacao: String,
      classeTerapeutica: String,
      genericos: [{
        nome: String,
        laboratorio: String
      }]
    }],

    exames: [{
      nome: String,
      exameRecebido: Boolean,
      exameEntreguePaciente: Boolean
    }]
  }
)

module.exports = mongoose.model('Atendimento', atendimentoSchema);