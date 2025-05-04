const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');

// Staff login validation
router.post('/staff-login', (req, res) => {
  let { username, password, role } = req.body;
  role = role.toLowerCase(); // Normalize for comparison

  const sql = `
    SELECT * FROM staff 
    WHERE username = ? AND password = ? AND LOWER(role) = ?
  `;

  db.query(sql, [username, password, role], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      const staff = results[0];
      req.session.user = {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        role: staff.role.toLowerCase(), // Store normalized role
        doc_department: staff.doc_department // optional
      };

      console.log('Logged in as:', req.session.user);

      if (req.session.user.role === 'doctor') {
        return res.redirect('/doctor_dashboard.html');
      } else if (req.session.user.role === 'receptionist') {
        return res.redirect('/receptionist_dashboard.html');
      } else {
        return res.redirect('/staff_dashboard.html');
      }
    } else {
      return res.send('<script>alert("Invalid credentials"); window.location.href="/staff_login.html";</script>');
    }
  });
});

// Staff logout route
router.get('/staff-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.redirect('/staff_login.html');
  });
});

// Doctor dashboard route protection
router.get('/doctor-dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'doctor') {
    return res.redirect('/staff_login.html');
  }

  res.sendFile(path.join(__dirname, '../public/doctor_dashboard.html'));
});

module.exports = router;
