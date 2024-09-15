const express = require('express');
const cors = require('cors'); // Import cors
const db = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
app.use(cors({
    origin : 'http://localhost:3000'
})); // Use cors middleware
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});