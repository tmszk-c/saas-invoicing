require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const Client = require('./models/Client');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Połączono z bazą MongoDB w chmurze!');
    app.listen(PORT, () => {
      console.log(`🚀 Serwer Node.js nasłuchuje na http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ Błąd połączenia z MongoDB:', err));

// --- STATYSTYKI ---
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
    res.status(500).json({ message: "Baza danych w chmurze jeszcze się uruchamia." });
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
    res.json(await Client.find());
  } catch (error) {
    res.status(500).json({ message: "Problem z połączeniem cloud." });
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
    res.json(await Product.find());
  } catch (error) {
    res.status(500).json({ message: "Problem z połączeniem cloud." });
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
    res.json(await Invoice.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: "Problem z połączeniem cloud." });
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

// ========================================================
// --- KSEF 2.0 TEST - KROK 1: POBRANIE WYZWANIA (CHALLENGE) --
// ========================================================

app.put('/api/invoices/:id/ksef', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Nie znaleziono faktury' });
    }

    // 🔥 AKTUALIZACJA 2026: Nowy adres serwera KSeF 2.0
    const KSEF_TEST_URL = 'https://api-test.ksef.mf.gov.pl/v2/auth/challenge';

    console.log('\n➡️ Pukam do nowych drzwi KSeF 2.0 Test...');

    try {
      // W nowym API wywołujemy endpoint bez NIPu w ciele, dostaniemy czysty Challenge
      const ksefResponse = await axios.post(KSEF_TEST_URL, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Error-Format': 'problem-details' // Wymóg specyfikacji API 2.0
        }
      });

      console.log('✅ KSeF 2.0 odpowiedział! Otrzymano Challenge:', ksefResponse.data.challenge);

      res.json({
        message: 'Nawiązano połączenie z KSeF 2.0 (Krok 1 - Sukces)! Zobacz konsolę serwera.',
        challenge: ksefResponse.data.challenge
      });

    } catch (ksefError) {
      // Tym razem, jeśli MF nam odmówi, to otrzymamy cywilizowany powód błędu
      console.error('❌ Błąd odpowiedzi od serwerów MF:', ksefError.message);

      if (ksefError.response && ksefError.response.data) {
        console.error('Szczegóły błędu MF:', ksefError.response.data);
      }

      const errorMsg = ksefError.response?.data?.title || ksefError.response?.data?.message || ksefError.message;
      return res.status(ksefError.response?.status || 500).json({ message: 'Błąd KSeF: ' + errorMsg });
    }

  } catch (error) {
    console.error('❌ Błąd wewnętrzny serwera:', error);
    res.status(500).json({ message: 'Błąd serwera: ' + error.message });
  }
});
