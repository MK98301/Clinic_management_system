const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const adminRoutes = require('./routes/admin');//admin route
const receptionistRoutes = require('./routes/receptionist');//receptionist route
const patientRoutes = require('./routes/patient'); //patient route
const appointmentRoutes = require('./routes/appointment');//appointment route
const staffloginRoutes = require('./routes/staff_login');//staff login route
const authRouter = require('./routes/auth');

const app = express();
const PORT = 3000;

//logout session
const session = require('express-session');

app.use(session({
  secret: 'clinic-secret-key', // change to a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true only if using HTTPS
}));

app.use(morgan('dev'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // where HTML files live



// Routes
app.use('/', adminRoutes); //admin route
//app.use(express.static('public'));
app.use('/', receptionistRoutes); //receptionist route
app.use('/',patientRoutes);
app.use('/',appointmentRoutes);
app.use('/',staffloginRoutes);
app.use('/api/auth', authRouter); 

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
