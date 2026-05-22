require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Client = require('./models/Client');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice');
const User = require('./models/User'); // Model użytkownika

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Zabezpieczenie przed nieskończonym ładowaniem i zawieszaniem bazy
mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Połączono z bazą MongoDB w chmurze!');

    // Serwer startuje DOPIERO gdy baza jest gotowa
    app.listen(PORT, () => {
      console.log(`🚀 Serwer Node.js nasłuchuje na http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ Błąd połączenia z MongoDB:', err));

// --- STATYSTYKI (PULPIT) ---
app.get('/api/stats', async (req, res) => {
  try {
    const clientsCount = await Client.countDocuments();
    const productsCount = await Product.countDocuments();
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.totalGross) || 0), 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

    res.json({
      clients: clientsCount,
      products: productsCount,
      invoices: invoices.length,
      revenue: totalRevenue,
      pending: pendingInvoices
    });
  } catch (error) {
    res.status(500).json({ message: "Baza danych w chmurze jeszcze się uruchamia. Spróbuj za chwilę." });
  }
});

// --- REJESTRACJA I LOGOWANIE ---
app.post('/api/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym adresem e-mail już istnieje!' });
    }
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'Konto utworzone pomyślnie!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email, password: password });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy e-mail lub hasło!' });
    }
    res.json({
      message: 'Zalogowano pomyślnie!',
      user: { id: user._id, name: user.companyName, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- KLIENCI ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Problem z połączeniem cloud. Spróbuj ponownie." });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    res.status(201).json(await newClient.save());
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
    res.status(500).json({ message: "Problem z połączeniem cloud. Spróbuj ponownie." });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    res.status(201).json(await newProduct.save());
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

// --- FAKTURY ---
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Problem z połączeniem cloud. Spróbuj ponownie." });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    res.status(201).json(await newInvoice.save());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
