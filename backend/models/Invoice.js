const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  number: { type: String, required: true }, // Np. FV/2026/05/123
  clientName: { type: String, required: true },
  clientNip: { type: String, required: true },
  items: { type: Array, required: true }, // Lista produktów na fakturze
  totalGross: { type: Number, required: true },
  issueDate: { type: String, required: true },
  status: { type: String, default: 'pending' } // status dla KSeF: pending, sent, error
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
