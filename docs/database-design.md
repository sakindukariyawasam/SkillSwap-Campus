
# SkillSwap Campus - Database Design

## 1. Introduction

SkillSwap Campus uses a relational SQLite database.

The application has three main tables:

- users
- skills
- exchange_requests

The database is managed using better-sqlite3.

## 2. Users Table

The users table stores registered student information.

| Field | Data Type | Constraint |
|---|---|---|
| id | INTEGER | Primary Key, AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

The id field uniquely identifies each student.

The email field must be unique.

Passwords are stored as hashes.

## 3. Skills Table

The skills table stores skills offered by students.

| Field | Data Type | Constraint |
|---|---|---|
| id | INTEGER | Primary Key, AUTOINCREMENT |
| user_id | INTEGER | Foreign Key, NOT NULL |
| title | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

The user_id field references users.id.

One student can offer multiple skills.

## 4. Exchange Requests Table

The exchange_requests table stores learning requests.

| Field | Data Type | Constraint |
|---|---|---|
| id | INTEGER | Primary Key, AUTOINCREMENT |
| skill_id | INTEGER | Foreign Key, NOT NULL |
| requester_id | INTEGER | Foreign Key, NOT NULL |
| status | TEXT | NOT NULL, CHECK, DEFAULT 'pending' |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

The skill_id field references skills.id.

The requester_id field references users.id.

A request can have one of three statuses:

- pending
- accepted
- rejected

## 5. Database Relationships

The database uses three one-to-many relationships.

### Users to Skills

One user can offer many skills.

Each skill belongs to one user.

Relationship:

users.id -> skills.user_id

### Users to Exchange Requests

One user can send many learning requests.

Each request belongs to one requester.

Relationship:

users.id -> exchange_requests.requester_id

### Skills to Exchange Requests

One skill can receive multiple learning requests.

Each request refers to one skill.

Relationship:

skills.id -> exchange_requests.skill_id

## 6. Data Integrity

The database uses several constraints.

PRIMARY KEY:
Uniquely identifies each record.

FOREIGN KEY:
Maintains relationships between tables.

NOT NULL:
Prevents essential fields from being null.

UNIQUE:
Prevents duplicate email addresses.

CHECK:
Allows only pending, accepted and rejected statuses.

ON DELETE CASCADE:
Automatically removes related dependent records
when the referenced record is deleted.

The application also checks whether the logged-in
student owns a skill before allowing updates or deletion.

## 7. Database Indexes

Indexes were added to improve database queries.

idx_skills_user:
Speeds up lookups of skills belonging to a student.

idx_requests_requester:
Helps retrieve requests sent by a student.

idx_requests_active_lookup:
Helps identify existing learning requests for a skill
and requester.

These indexes improve database performance without
changing the existing table structure.

## 8. Entity Relationship Diagram

![SkillSwap Campus ER Diagram](../SkillSwap_ER_Diagram.png)

## 9. UI/UX and Responsiveness

The interface uses a consistent green-and-white theme.

The application provides:

- Clear navigation
- Consistent buttons
- Styled skill cards
- Color-coded learning request statuses
- Responsive forms
- Mobile-friendly skill cards
- Keyboard focus indicators
- Responsive layouts for desktop, tablet and mobile

The improved interface preserves the original
application workflow and functionality.
