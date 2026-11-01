
const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.use((req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: 'Please login first'
        });
    }

    next();
});

// Send a learning request
router.post('/', (req, res) => {
    const skillId = Number(req.body?.skillId);
    const userId = req.session.userId;

    if (!Number.isSafeInteger(skillId) || skillId <= 0) {
        return res.status(400).json({
            message: 'Invalid skill ID'
        });
    }

    try {
        const skill = db.prepare(
            'SELECT * FROM skills WHERE id = ?'
        ).get(skillId);

        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found'
            });
        }

        if (skill.user_id === userId) {
            return res.status(400).json({
                message: 'You cannot request your own skill'
            });
        }

        const existing = db.prepare(`
            SELECT id FROM exchange_requests
            WHERE skill_id = ?
            AND requester_id = ?
            AND status IN ('pending', 'accepted')
        `).get(skillId, userId);

        if (existing) {
            return res.status(409).json({
                message: 'You already have an active request for this skill'
            });
        }

        db.prepare(`
            INSERT INTO exchange_requests
            (skill_id, requester_id, status)
            VALUES (?, ?, 'pending')
        `).run(skillId, userId);

        res.status(201).json({
            message: 'Learning request sent successfully!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to send request'
        });
    }
});

// View requests sent by the student
router.get('/sent', (req, res) => {
    try {
        const requests = db.prepare(`
            SELECT
                r.id,
                r.skill_id,
                r.status,
                r.created_at,
                s.title AS skill_title,
                u.name AS owner_name
            FROM exchange_requests r
            JOIN skills s ON r.skill_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE r.requester_id = ?
            ORDER BY r.id DESC
        `).all(req.session.userId);

        res.json(requests);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to load sent requests'
        });
    }
});

// View requests received by skill owner
router.get('/received', (req, res) => {
    try {
        const requests = db.prepare(`
            SELECT
                r.id,
                r.skill_id,
                r.status,
                r.created_at,
                s.title AS skill_title,
                u.name AS requester_name
            FROM exchange_requests r
            JOIN skills s ON r.skill_id = s.id
            JOIN users u ON r.requester_id = u.id
            WHERE s.user_id = ?
            ORDER BY r.id DESC
        `).all(req.session.userId);

        res.json(requests);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to load received requests'
        });
    }
});

// Accept or reject a request
router.patch('/:id/status', (req, res) => {
    const requestId = Number(req.params.id);
    const { status } = req.body || {};

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
        return res.status(400).json({
            message: 'Invalid request ID'
        });
    }

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
            message: 'Invalid request status'
        });
    }

    try {
        const request = db.prepare(`
            SELECT
                r.id,
                r.status,
                s.user_id AS owner_id
            FROM exchange_requests r
            JOIN skills s ON r.skill_id = s.id
            WHERE r.id = ?
        `).get(requestId);

        if (!request) {
            return res.status(404).json({
                message: 'Request not found'
            });
        }

        if (request.owner_id !== req.session.userId) {
            return res.status(403).json({
                message: 'Only the skill owner can respond'
            });
        }

        if (request.status !== 'pending') {
            return res.status(409).json({
                message: 'This request has already been processed'
            });
        }

        const result = db.prepare(`
            UPDATE exchange_requests
            SET status = ?
            WHERE id = ? AND status = 'pending'
        `).run(status, requestId);

        if (result.changes === 0) {
            return res.status(409).json({
                message: 'Request status has already changed'
            });
        }

        res.json({
            message: 'Request ' + status + ' successfully!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update request'
        });
    }
});

module.exports = router;
