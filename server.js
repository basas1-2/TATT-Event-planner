const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: 'your-secret-key', // Change this to a secure key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Endpoint to handle form submission
app.post('/submit-form', (req, res) => {
  const { phone, event, location, date, budget, message } = req.body;
  const submission = {
    id: Date.now(),
    phone,
    event,
    location,
    date,
    budget,
    message,
    timestamp: new Date().toISOString()
  };

  // Read existing submissions
  let submissions = [];
  try {
    const data = fs.readFileSync('submissions.json', 'utf8');
    submissions = JSON.parse(data);
  } catch (err) {
    // File doesn't exist or is empty
  }

  // Add new submission
  submissions.push(submission);

  // Write back to file
  fs.writeFileSync('submissions.json', JSON.stringify(submissions, null, 2));

  res.json({ success: true });
});

// Endpoint to get submissions for admin
app.get('/admin-data', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const data = fs.readFileSync('submissions.json', 'utf8');
    const submissions = JSON.parse(data);
    res.json(submissions);
  } catch (err) {
    res.json([]);
  }
});

// Admin register
app.post('/admin/register', (req, res) => {
  const { username, password } = req.body;
  try {
    const data = fs.readFileSync('admin.json', 'utf8');
    const admin = JSON.parse(data);
    return res.status(400).json({ error: 'Admin already registered' });
  } catch (err) {
    // No admin yet
  }
  const admin = { username, password };
  fs.writeFileSync('admin.json', JSON.stringify(admin, null, 2));
  req.session.admin = true;
  res.json({ success: true });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const data = fs.readFileSync('admin.json', 'utf8');
    const admin = JSON.parse(data);
    if (admin.username === username && admin.password === password) {
      req.session.admin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Admin not registered' });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});