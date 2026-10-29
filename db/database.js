
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'skillswap.db'));

db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exchange_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_id INTEGER NOT NULL,
        requester_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
            CHECK(status IN ('pending', 'accepted', 'rejected')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (skill_id) REFERENCES skills(id)
            ON DELETE CASCADE,
        FOREIGN KEY (requester_id) REFERENCES users(id)
            ON DELETE CASCADE
    );
`);

console.log('SkillSwap database connected successfully!');

module.exports = db;
