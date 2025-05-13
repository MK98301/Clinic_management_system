// db.js
//const mysql = require('mysql2');  // ✅ This line was missing

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'mk123',
//   database: 'clinic_management_system'
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log('MySQL connected...');
// });

// db.js
const mysql = require('mysql2');

require('dotenv').config();


const db = mysql.createConnection({
  host: process.env.DB_HOST,       // e.g., db-provider-host.com
  user: process.env.DB_USER,       // e.g., your db username
  password: process.env.DB_PASS,   // your db password
  database: process.env.DB_NAME,   // name of your database
  port: 3306                       // default MySQL port
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('✅ MySQL connected as id ' + db.threadId);
});

module.exports = db;



