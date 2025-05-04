const express = require('express');
const router = express.Router();

// Return logged-in staff member info
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { full_name, role } = req.session.user;

  // Case-insensitive role check
  if (role.toLowerCase() !== 'doctor') {
    return res.status(403).json({ error: 'Access denied: not a doctor' });
  }

  res.json({ full_name }); // this should match appointments.doc_name
});

module.exports = router;
