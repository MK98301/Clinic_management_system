const express = require('express');
const router = express.Router();
const db = require('../db'); // your db connection module

// Get patient by phone number
router.get('/patient', (req, res) => {
  const phone = req.query.phone;
  const sql = 'SELECT * FROM patients WHERE phone_no = ?';
  db.query(sql, [phone], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const patient = results[0];
    res.json({
      id: patient.patient_id,
      name: patient.patient_name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone_no
    });
  });
});

// Get unique departments from staff table
router.get('/departments', (req, res) => {
  const sql = 'SELECT DISTINCT doc_department FROM staff WHERE doc_department IS NOT NULL AND role = "doctor"';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const departments = results.map(row => row.doc_department);
    res.json(departments);
  });
});

// Get doctors by department
router.get('/doctors', (req, res) => {
  const department = req.query.department;
  const sql = 'SELECT full_name FROM staff WHERE role = "doctor" AND doc_department = ?';
  db.query(sql, [department], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const doctors = results.map(row => row.full_name);
    res.json(doctors);
  });
});

// Route to get consultation fee based on doctor name
router.get('/api/doctor-fee', (req, res) => {
  const doctorName = req.query.name;
  if (!doctorName) return res.status(400).json({ error: 'Doctor name required' });

  const sql = 'SELECT consultation_fee FROM staff WHERE full_name = ? AND role = "doctor"';
  db.query(sql, [doctorName], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (rows.length > 0) {
      res.json({ fee: rows[0].consultation_fee });
    } else {
      res.status(404).json({ error: 'Doctor not found' });
    }
  });
});

// Save appointment and generate token
router.post('/save-appointment', (req, res) => {
  const {
    patient_id,
    temperature,
    reason,
    department,
    doctor,
    date
  } = req.body;
  console.log('Received appointment data:', req.body);

  if (!patient_id || !department || !doctor || !reason || !date) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const insertAppointment = `
    INSERT INTO appointments 
    (patient_id, temperature, reason_for_visit, doc_department, doc_name, date_of_visit) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(insertAppointment, [patient_id, temperature, reason, department, doctor, date], (err, result) => {
    if (err) {
      console.error('Error saving appointment:', err);
      return res.status(500).json({ error: 'Failed to save appointment' });
    }
    // db.query(insertQuery, [patient_id, department, doctor, temperature, reason, date], (err, result) => {
    //   if (err) {
    //     console.error('Error saving appointment:', err);
    //     return res.status(500).json({ success: false, error: 'Database error' });
    //   }

    const appointmentId = result.insertId;

    // Create token
    const insertToken = `
      INSERT INTO tokens (patient_id, appointment_id) 
      VALUES (?, ?)`;

    db.query(insertToken, [patient_id, appointmentId], (err2, tokenResult) => {
      if (err2) {
        console.error('Error generating token:', err2);
        return res.status(500).json({ error: 'Failed to generate token' });
      }

      const receiptNumber = tokenResult.insertId;

      // Fetch patient and doctor info
      const patientSql = 'SELECT * FROM patients WHERE patient_id = ?';
      const doctorSql = 'SELECT consultation_fee FROM staff WHERE full_name = ? AND role = "doctor"';

      db.query(patientSql, [patient_id], (err3, patientResults) => {
        if (err3 || patientResults.length === 0) return res.status(500).json({ error: 'Failed to fetch patient info' });

        const patient = patientResults[0];

        db.query(doctorSql, [doctor], (err4, doctorResults) => {
          if (err4 || doctorResults.length === 0) return res.status(500).json({ error: 'Failed to fetch doctor fee' });

          const fee = doctorResults[0].consultation_fee;

          res.json({
            success: true,
            appointment_id: appointmentId,
            token_number: tokenResult.insertId,
            receipt_no: receiptNumber,
            date,
            patient,
            doctor_name: doctor,
            doctor_department: department,
            consultation_fee: fee,
            total: fee // assuming total = consultation fee only
          });
        });
      });
    });
 });
});


    // Get today's appointments for a specific doctor
    router.get('/doctor/today-appointments', (req, res) => {
      const doctor = req.query.doctor;
      const date = req.query.date;

      if (!doctor || !date) {
        return res.status(400).json({ error: 'Missing doctor or date parameter' });
      }

      const sql = `
  SELECT 
    p.patient_name,
    p.age,
    p.gender,
    a.reason_for_visit,
    a.temperature,
    a.patient_id
  FROM appointments a
  JOIN patients p ON a.patient_id = p.patient_id
  WHERE a.doc_name = ? AND a.date_of_visit = ? AND (a.prescription IS NULL OR a.prescription = "")
  ORDER BY a.created_at ASC
`;


      db.query(sql, [doctor, date], (err, results) => {
        if (err) {
          console.error('Error fetching appointments:', err);
          return res.status(500).json({ error: 'Failed to fetch appointments' });
        }

        res.json(results);
      });
    });

    // Get full patient + latest appointment details
    router.get('/doctor/patient-appointment', (req, res) => {
      const patientId = req.query.patient_id;
      if (!patientId) return res.status(400).json({ error: 'Missing patient_id' });

      const patientSql = 'SELECT * FROM patients WHERE patient_id = ?';
      const appointmentSql = `
    SELECT * FROM appointments 
    WHERE patient_id = ? 
    ORDER BY date_of_visit DESC, created_at DESC 
    LIMIT 1
  `;

      db.query(patientSql, [patientId], (err1, patientResults) => {
        if (err1) return res.status(500).json({ error: 'Failed to fetch patient' });
        if (patientResults.length === 0) return res.status(404).json({ error: 'Patient not found' });

        const patient = patientResults[0];

        db.query(appointmentSql, [patientId], (err2, appointmentResults) => {
          if (err2) return res.status(500).json({ error: 'Failed to fetch appointment' });
          if (appointmentResults.length === 0) return res.status(404).json({ error: 'No appointment found' });

          res.json({
            patient,
            appointment: appointmentResults[0]
          });
        });
      });
    });

    // Save prescription details into an existing appointment
    router.post('/doctor/save-prescription', (req, res) => {
      const {
        appointment_id,
        diagnosis,
        description,
        prescription,
        dosage,
        instructions
      } = req.body;

      if (!appointment_id || !diagnosis || !description || !prescription || !dosage || !instructions) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const sql = `
    UPDATE appointments 
    SET diagnosis = ?, description = ?, prescription = ?, dosage = ?, instructions = ?
    WHERE appointment_id = ?
  `;

      db.query(sql, [diagnosis, description, prescription, dosage, instructions, appointment_id], (err, result) => {
        if (err) {
          console.error('Error saving prescription:', err);
          return res.status(500).json({ error: 'Failed to save prescription' });
        }

        res.json({ success: true, message: 'Prescription saved successfully' });
      });
    });


    module.exports = router;




