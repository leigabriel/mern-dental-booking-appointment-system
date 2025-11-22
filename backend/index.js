const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to call this API
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses form data

// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the DentalCare API!' });
});

// --- Register All Routes ---
require('./routes/auth.routes')(app);
require('./routes/doctor.routes')(app);
require('./routes/service.routes')(app);
require('./routes/appointment.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/payment.routes')(app);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`API Documentation:`);
    console.log(`- Auth: POST /api/auth/register, /api/auth/login`);
    console.log(`- Doctors: GET /api/doctors`);
    console.log(`- Services: GET /api/services`);
    console.log(`- Appointments: POST /api/appointments`);
});