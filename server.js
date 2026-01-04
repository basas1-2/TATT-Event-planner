const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const Admin = require('./models/Admin');
const Submission = require('./models/Submission');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and only start server after successful connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit so the server does not run without DB
  });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Change this to a secure key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Endpoint to handle form submission
app.post('/submit-form', async (req, res) => {
  const { phone, event, location, date, budget, message } = req.body;
  const submission = new Submission({
    phone,
    event,
    location,
    date,
    budget,
    message
  });

  try {
    await submission.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error saving submission' });
  }
});

// Endpoint to get submissions for admin
app.get('/admin-data', async (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

// Endpoint to delete a submission
app.delete('/admin/delete/:id', async (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting submission' });
  }
});

// Admin register
app.post('/admin/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Admin already registered' });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    req.session.admin = true;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error registering admin' });
  }
});

// Admin login
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, password });
    if (admin) {
      req.session.admin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Admin logout
app.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check if logged in
app.get('/admin/check', (req, res) => {
  res.json({ loggedIn: !!req.session.admin });
});

// Note: server is started after successful MongoDB connection above