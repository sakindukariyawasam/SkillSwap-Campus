
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');

const router = express.Router();

// Student Registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
        return res.status(400).json({
            message: 'Please complete all fields'
        });
    }

    const studentName = name.trim();
    const studentEmail = email.trim().toLowerCase();

    if (
        studentName.length < 2 ||
        studentName.length > 80 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail) ||
        password.length < 8 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        return res.status(400).json({
            message: 'Enter a valid name, email and password'
        });
    }

    try {
        const existing = db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).get(studentEmail);

        if (existing) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.prepare(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
        ).run(studentName, studentEmail, hashedPassword);

        res.status(201).json({
            message: 'Registration successful!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Registration failed'
        });
    }
});

// Student Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() || !password) {
        return res.status(400).json({
            message: 'Enter your email and password'
        });
    }

    try {
        const student = db.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).get(email.trim().toLowerCase());

        if (!student) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            student.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    message: 'Login failed'
                });
            }

            req.session.userId = student.id;

            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        message: 'Login failed'
                    });
                }

                res.json({
                    message: 'Login successful!',
                    name: student.name
                });
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
});

// Get Logged-In Student
router.get('/me', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: 'Not logged in'
        });
    }

    const student = db.prepare(
        'SELECT id, name, email FROM users WHERE id = ?'
    ).get(req.session.userId);

    if (!student) {
        return res.status(401).json({
            message: 'Not logged in'
        });
    }

    res.json(student);
});

// Student Logout
router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.status(401).json({
            message: 'Not logged in'
        });
    }

    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: 'Logout failed'
            });
        }

        res.clearCookie('connect.sid');

        res.json({
            message: 'Logged out successfully'
        });
    });
});

module.exports = router;
