const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db is the module managing your database connection

// Get list of unique departments
router.get('/api/departments', (req, res) => {
    const sql = `SELECT DISTINCT doc_department FROM staff WHERE role = 'doctor' AND doc_department IS NOT NULL`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).send('Database error');
        }
        const departments = results.map(row => row.doc_department);
        res.json(departments);
    });
});

// Get list of doctors based on selected department
router.get('/api/doctors', (req, res) => {
    const department = req.query.department;
    
    if (!department) {
        return res.status(400).send('Missing department');
    }

    const sql = `SELECT full_name FROM staff WHERE role = 'doctor' AND doc_department = ?`;

    db.query(sql, [department], (err, results) => {
        if (err) {
            console.error('Error fetching doctors:', err);
            return res.status(500).send('Database error');
        }
        const doctors = results.map(row => row.full_name);
        res.json(doctors);
    });
});

// Create a new appointment
router.post('/create-appointment', (req, res) => {
    const {
        patient_name,
        age,
        gender,
        temperature,
        reason_for_visit,
        department,
        doctor_name
    } = req.body;

    if (!patient_name || !age || !gender || !temperature || !reason_for_visit || !department || !doctor_name) {
        return res.status(400).send('All fields are required.');
    }

    const sql = `
        INSERT INTO appointments (
            patient_name, age, gender, temperature,
            reason_for_visit, doc_department, doctor_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [patient_name, age, gender, temperature, reason_for_visit, department, doctor_name],
        (err, result) => {
            if (err) {
                console.error('Error saving appointment:', err);
                return res.status(500).send('Failed to save appointment');
            }

            res.send('<script>alert("Appointment saved successfully!"); window.location.href="/receptionist_dashboard.html";</script>');
        }
    );
});

module.exports = router;
