
const express = require('express');
const db = require('../db/database');

const router = express.Router();

// READ - View all skills
router.get('/', (req, res) => {
    try {
        const skills = db.prepare(`
            SELECT
                skills.id,
                skills.user_id,
                skills.title,
                skills.category,
                skills.description,
                skills.created_at,
                users.name AS student_name
            FROM skills
            JOIN users ON skills.user_id = users.id
            ORDER BY skills.id DESC
        `).all();

        res.json(skills);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to load skills'
        });
    }
});


// CREATE - Add a new skill
router.post('/', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: 'Please login first'
        });
    }

    const { title, category, description } = req.body || {};

    if (
        typeof title !== 'string' ||
        typeof category !== 'string' ||
        typeof description !== 'string'
    ) {
        return res.status(400).json({
            message: 'Please complete all fields'
        });
    }

    const skillTitle = title.trim();
    const skillCategory = category.trim();
    const skillDescription = description.trim();

    if (
        skillTitle.length < 3 ||
        skillTitle.length > 100 ||
        skillCategory.length < 2 ||
        skillCategory.length > 50 ||
        skillDescription.length < 10 ||
        skillDescription.length > 1000
    ) {
        return res.status(400).json({
            message: 'Please enter valid skill details'
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO skills
            (user_id, title, category, description)
            VALUES (?, ?, ?, ?)
        `).run(
            req.session.userId,
            skillTitle,
            skillCategory,
            skillDescription
        );

        res.status(201).json({
            message: 'Skill added successfully!',
            skillId: result.lastInsertRowid.toString()
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to add skill'
        });
    }
});


// UPDATE - Edit an existing skill
router.put('/:id', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: 'Please login first'
        });
    }

    const id = Number(req.params.id);
    const { title, category, description } = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid skill ID'
        });
    }

    if (
        typeof title !== 'string' ||
        typeof category !== 'string' ||
        typeof description !== 'string'
    ) {
        return res.status(400).json({
            message: 'Please complete all fields'
        });
    }

    const skillTitle = title.trim();
    const skillCategory = category.trim();
    const skillDescription = description.trim();

    if (
        skillTitle.length < 3 ||
        skillTitle.length > 100 ||
        skillCategory.length < 2 ||
        skillCategory.length > 50 ||
        skillDescription.length < 10 ||
        skillDescription.length > 1000
    ) {
        return res.status(400).json({
            message: 'Please enter valid skill details'
        });
    }

    try {
        const skill = db.prepare(
            'SELECT user_id FROM skills WHERE id = ?'
        ).get(id);

        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found'
            });
        }

        if (skill.user_id !== req.session.userId) {
            return res.status(403).json({
                message: 'You can only edit your own skills'
            });
        }

        db.prepare(`
            UPDATE skills
            SET title = ?, category = ?, description = ?
            WHERE id = ? AND user_id = ?
        `).run(
            skillTitle,
            skillCategory,
            skillDescription,
            id,
            req.session.userId
        );

        res.json({
            message: 'Skill updated successfully!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update skill'
        });
    }
});


// DELETE - Remove an existing skill
router.delete('/:id', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: 'Please login first'
        });
    }

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid skill ID'
        });
    }

    try {
        const skill = db.prepare(
            'SELECT user_id FROM skills WHERE id = ?'
        ).get(id);

        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found'
            });
        }

        if (skill.user_id !== req.session.userId) {
            return res.status(403).json({
                message: 'You can only delete your own skills'
            });
        }

        const result = db.prepare(
            'DELETE FROM skills WHERE id = ? AND user_id = ?'
        ).run(id, req.session.userId);

        if (result.changes === 0) {
            return res.status(404).json({
                message: 'Skill not found'
            });
        }

        res.json({
            message: 'Skill deleted successfully!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete skill'
        });
    }
});

module.exports = router;
