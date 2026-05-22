require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Client = require('./models/Client');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice'); // Nowy import!

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Połączono z bazą MongoDB w chmurze!'))
  .catch((err) => console.error('❌ Błąd połączenia z MongoDB:', err));

// --- KLIENCI ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Klient usunięty' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- PRODUKTY ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produkt usunięty' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- FAKTURY (NOWOŚĆ) ---
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }); // Pobiera od najnowszych
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ message: 'Serwer Node.js i baza danych działają poprawnie!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer Node.js nasłuchuje na http://localhost:${PORT}`);
});
