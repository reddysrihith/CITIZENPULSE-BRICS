const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Express API Router from backend/routes/api
const apiRoutes = require('../backend/routes/api');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

module.exports = app;
