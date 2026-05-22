const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  nip: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique oznacza, że e-mail nie może się powtórzyć w bazie
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
