
const express = require('express');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');

const db = require('./db/database');
const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET ||
        crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        message: 'SkillSwap Campus API is running',
        database: 'Connected'
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`SkillSwap Campus running at http://localhost:${PORT}`);
});
