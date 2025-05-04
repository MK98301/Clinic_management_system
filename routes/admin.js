// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Admin Login Handler
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT * FROM staff 
    WHERE username = ? AND password = ? AND role = 'Admin'
  `;

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length > 0) {
      //store admin session
      req.session.admin = {
        id: results[0].user_id,
        username: results[0].username,
        full_name: results[0].full_name
      };
      // Successful login
      res.redirect('/admin_dashboard.html');
    } else {
      // Failed login
      res.send('<script>alert("Invalid username or password."); window.location.href="/admin_login.html";</script>');
    }
  });
});

//admin logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.send('Logout failed');
    }
    res.redirect('/admin_login.html');
  });
});

//to prevent access without login for admin
router.get('/admin-dashboard', (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin_login.html');
  }

  // Render or send dashboard page (if dynamic)
  res.sendFile(path.join(__dirname, '../public/admin_dashboard.html'));
});

//insert staff data in database
router.post('/admin-dashboard', (req, res) => {
  const {
    username,
    password,
    full_name,
    role,
    phone,
    email,
    gender,
    date_of_joining,
    consultation_fee,
    address,
    doc_department
  } = req.body;

  const sql = `
    INSERT INTO staff 
    (username, password, full_name, role, phone, email, gender, date_of_joining, consultation_fee, address, doc_department)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    username,
    password,
    full_name,
    role,
    phone,
    email,
    gender,
    date_of_joining,
    consultation_fee,
    address,
    doc_department
  ], (err, result) => {
    if (err) {
      console.error('Error inserting staff:', err);
      return res.send('Error saving staff data');
    }

    res.send('<script>alert("Staff saved successfully!"); window.location.href="/admin_dashboard.html";</script>');
  });
});




module.exports = router;
