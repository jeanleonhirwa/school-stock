const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const borrowRoutes = require('./routes/borrow');
const stockRoutes = require('./routes/stock');
const returnRoutes = require('./routes/return');
const historyRoutes = require('./routes/history');

// Use routes
app.use('/api', borrowRoutes);
app.use('/api', stockRoutes);
app.use('/api', returnRoutes);
app.use('/api', historyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'School Stock Management API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
