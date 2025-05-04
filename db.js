// db.js
const mysql = require('mysql2');  // ✅ This line was missing

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MK@123',
  database: 'clinic_management_system'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected...');
});

module.exports = db;
