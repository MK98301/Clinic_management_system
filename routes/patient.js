const express = require('express');
const router = express.Router();
const db = require('../db');

// POST route to register patient
router.post('/register-patient', (req, res) => {
  const { patient_name, gender, phone_no, email, age, medical_history, any_allergies } = req.body;

  if (!patient_name || !gender || !phone_no || !age) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO patients 
    (patient_name, gender, phone_no, email, age, medical_history, any_allergies)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [patient_name, gender, phone_no, email, age, medical_history, any_allergies], (err, result) => {
    if (err) {
      console.error('Error inserting patient:', err);
      return res.status(500).json({ success: false, message: 'Database insert failed' });
    }

    console.log('Patient registered successfully:', result);
    res.json({ success: true, message: 'Patient registered successfully. You can visit the clinic for checkup.' });
  });
});

// GET patient by phone number
router.get('/patient', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  try {
    db.query('SELECT * FROM patients WHERE phone_no = ?', [phone], (err, results) => {
      if (err) {
        console.error('Error fetching patient:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      }

      if (results.length > 0) {
        res.json({ success: true, patient: results[0] });
      } else {
        res.json({ success: false, message: 'Patient not found' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Unexpected error' });
  }
});



module.exports = router;
