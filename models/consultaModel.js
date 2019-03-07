var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var consultaSchema = new Schema (
  {
    medico: {
      id: Schema.Types.ObjectId,
      nome: String
    },
    paciente: {
      id: Schema.Types.ObjectId,
      nome: String,
      telefone: String
    },    
    data: String,
    hora: String,
    horaItem: Number,
    confirmacao: Boolean,
    cafezinho: Boolean
  }
);

module.exports = mongoose.model('Consulta', consultaSchema);