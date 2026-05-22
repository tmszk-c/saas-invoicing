const mongoose = require('mongoose');

// Tworzymy "schemat" (przepis) na to, jak ma wyglądać klient w bazie
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nip: { type: String, required: true },
  email: { type: String },
  status: { type: String, default: 'active' } // Domyślnie klient jest aktywny
}, { timestamps: true }); // Automatycznie doda datę utworzenia

// Eksportujemy model, żeby serwer mógł go używać
module.exports = mongoose.model('Client', clientSchema);
