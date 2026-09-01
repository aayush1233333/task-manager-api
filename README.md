# Task Manager API

A small Node.js + Express + MongoDB (Mongoose) CRUD API for managing tasks.
Built specifically to get hands-on with MongoDB — schema design, indexes,
validation, and cursor-based pagination — using the same patterns as my
[Product Catalog](https://github.com/aayush1233333/inventory-system) project,
just against a document database instead of PostgreSQL.

## Why this project exists

My other backend projects (Product Catalog, StockFlow, Agentic Incident
Triage) all use relational databases (PostgreSQL/MySQL). This project fills
that specific gap with real, working MongoDB experience: Mongoose schemas,
field-level validation, compound indexes, and `_id`-based cursor pagination
— not just a database name on a resume.

## Tech Stack

- **Node.js** + **Express** — REST API framework
- **MongoDB** + **Mongoose** — database and ODM (schema validation, indexes)
- **dotenv** — environment configuration

## Features

- Full CRUD on tasks: create, list (with filtering + pagination), get by id, update, delete
- Schema-level validation (required fields, max length, enum constraints) via Mongoose
- Cursor-based pagination on `_id`, so results stay consistent even if new
  tasks are inserted mid-pagination — the same motivation as the keyset
  pagination used in the Product Catalog project, adapted to MongoDB's
  `ObjectId` ordering instead of a SQL composite index
- Compound index on `{ status, createdAt }` for the most common query pattern
- Centralized error handling (validation errors → 400, missing docs → 404,
  invalid ObjectIds → 400, unexpected errors → 500)

## Project Structure

```
task-manager-api/
├── config/
│   └── db.js              MongoDB connection (Mongoose)
├── models/
│   └── Task.js             Task schema, validation rules, indexes
├── controllers/
│   └── taskController.js  CRUD logic + cursor pagination
├── routes/
│   └── tasks.js            Route definitions
├── server.js                Express app entry point
├── .env.example
└── package.json
```

## API Reference

| Method | Route              | Description                                  |
|--------|---------------------|-----------------------------------------------|
| POST   | `/api/tasks`        | Create a task                                  |
| GET    | `/api/tasks`        | List tasks (`?status=&cursor=&limit=`)         |
| GET    | `/api/tasks/:id`    | Get a single task                              |
| PUT    | `/api/tasks/:id`    | Update a task                                  |
| DELETE | `/api/tasks/:id`    | Delete a task                                  |

### Task fields

| Field         | Type   | Notes                                           |
|---------------|--------|--------------------------------------------------|
| `title`       | String | Required, max 120 chars                          |
| `description` | String | Optional                                          |
| `status`      | String | `pending` \| `in_progress` \| `completed` (default `pending`) |
| `priority`    | String | `low` \| `medium` \| `high` (default `medium`)   |
| `dueDate`     | Date   | Optional                                          |

### Example: create a task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tests", "priority": "high"}'
```

### Example: paginated list

```bash
curl "http://localhost:5000/api/tasks?status=pending&limit=10"
```

Response:

```json
{
  "tasks": [...],
  "next_cursor": "665f1c2e8a1b2c3d4e5f6789",
  "has_next_page": true,
  "page_size": 10
}
```

Pass `next_cursor` back as `cursor` on the next request to get the following page.

## Local Setup

1. **Get a MongoDB connection string.** Easiest option: a free
   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster.
   Alternatively, run MongoDB locally (`mongodb://localhost:27017/task-manager`)
   if you have it installed.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # then edit .env and paste in your MONGODB_URI
   ```

4. **Run the server**

   ```bash
   npm start
   # or, for auto-restart on file changes:
   npm run dev
   ```

   Server runs at `http://localhost:5000`.

## What I'd add next

- Automated tests (Jest + Supertest) against a real or in-memory MongoDB instance
- Auth (JWT) — currently all endpoints are open, same limitation noted in my StockFlow project
- Text search on `title`/`description` using a MongoDB text index
- Rate limiting on write endpoints
