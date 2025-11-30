const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the DentalCare API!' });
});

require('./routes/auth.routes')(app);
require('./routes/doctor.routes')(app);
require('./routes/service.routes')(app);
require('./routes/appointment.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/payment.routes')(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`API Documentation:`);
    console.log(`- Auth: POST /api/auth/register, /api/auth/login`);
    console.log(`- Doctors: GET /api/doctors`);
    console.log(`- Services: GET /api/services`);
    console.log(`- Appointments: POST /api/appointments`);
});