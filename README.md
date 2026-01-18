# 🐝 Hive

**An AI-native backend framework for engineers who are *pissed off* about the complexity of modern technology.**

Hive preconfigures the entire backend stack: database, cache, queues, event handlers, auth, real-time — so you don't duct-tape different pieces yourself. It dictates a clean architecture that's easy to understand, easy to read, and scales to millions of users.

```bash
npm install -g @paralect/hive

hive init my-app
cd my-app
hive run ./src
```

Your API is live. MongoDB, validation, auth infrastructure, real-time events — all preconfigured.

---

## 🤖 AI-Native Development

Hive is designed for AI coding assistants. Open your project in Cursor and build with natural language:

```
add-resource tasks
add-endpoint tasks post title, status, assignee: { _id }
add-endpoint tasks get page, perPage
add-handler tasks
```

### Commands

| Command | What it does |
|---------|--------------|
| `add-resource tasks` | Create resource with schema + folders |
| `add-endpoint tasks post title, dueOn` | Create POST endpoint with inferred types |
| `add-endpoint tasks get page, perPage` | Create GET list endpoint |
| `add-endpoint tasks update /:id title` | Create PUT endpoint |
| `add-handler tasks` | Create event handlers for DB changes |
| `add-middleware isAdmin` | Create custom middleware |
| `add-service slack sendMessage` | Create service with go-to library |
| `add-scheduler sendReport daily at 9am` | Create cron job |

The AI understands Hive conventions and generates production-ready code.

---

## What's Preconfigured

| Concern | Solution |
|---------|----------|
| Database | MongoDB with auto-generated services per schema |
| Validation | Zod schemas, auto-applied to all endpoints |
| Auth | Token-based auth infrastructure, ready to extend |
| Events | Persistent handlers that react to DB changes |
| Real-time | Socket.io with Redis adapter for scaling |
| Queues | BullMQ for background jobs |
| Scheduler | Cron-based jobs, no external service needed |
| Auto-sync | Embedded documents stay fresh automatically |

You focus on your product. Hive handles the plumbing.

---

## Architecture

Every feature is a **resource** — a folder with predictable structure:

```
src/resources/{name}/
├── {name}.schema.js      # Data shape (required)
├── endpoints/            # API routes
├── handlers/             # React to DB events
└── methods/              # Shared logic
```

This scales. New developers understand it in minutes. Your codebase stays clean at 10 endpoints or 1000.

---

## 📦 Schemas

Define your data once. Hive creates the collection and service.

```javascript
import { z } from 'zod';
import dbSchema from 'helpers/schema/db.schema.js';

const schema = dbSchema.extend({
  title: z.coerce.string().nullable().optional(),
  status: z.coerce.string().default('pending'),
  assignee: z.object({
    _id: z.string(),
    fullName: z.coerce.string().nullable().optional(),
  }).nullable().optional(),
});

export default schema;
export const secureFields = ['internalNotes'];
```

Every schema gets `_id`, `createdOn`, `updatedOn` automatically.

---

## 🔌 Endpoints

Four exports. No router config.

```javascript
import { z } from 'zod';
import db from 'db';

const tasksService = db.services.tasks;

export const middlewares = [];

export const requestSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
});

export const handler = async (ctx) => {
  const { page, perPage } = ctx.validatedData;
  return tasksService.find({}, { page, perPage, sort: '-createdOn' });
};

export const endpoint = {
  url: '/',
  method: 'get',
};
```

Route auto-generated as `GET /tasks`.

---

## 🗄️ Database

Auto-generated services for every schema:

```javascript
import db from 'db';

const tasksService = db.services.tasks;

// Find
const { results, count } = await tasksService.find({ status: 'active' }, { page: 1, perPage: 20 });
const task = await tasksService.findOne({ _id: id });

// Create
const task = await tasksService.create({ title: 'New', user: ctx.state.user });

// Update
await tasksService.updateOne({ _id: id }, (doc) => ({ ...doc, status: 'done' }));

// Delete
await tasksService.remove({ _id: id });
```

---

## ⚡ Handlers

React to database changes. Perfect for side effects, notifications, syncing data.

```javascript
import db from 'db';
import ifUpdated from 'helpers/db/ifUpdated';

const tasksService = db.services.tasks;

tasksService.on('created', async ({ doc }) => {
  // Send notification, create activity log, etc.
});

tasksService.on('updated', ifUpdated(['status'], async ({ doc, prevDoc }) => {
  // Only runs when status changed
}));

tasksService.on('removed', async ({ doc }) => {
  // Cleanup related data
});
```

---

## 🛡️ Middlewares

Built-in: `allowNoAuth`, `isAuthorized`, `shouldExist`, `attachUser`

Custom:

```javascript
export default async (ctx, next) => {
  if (!ctx.state.user?.isAdmin) ctx.throw(403, 'Admin only');
  return next();
};
```

---

## ⏰ Scheduler

Background jobs with cron:

```javascript
import db from 'db';

export const handler = async () => {
  await db.services.invoices.updateMany(
    { isPaid: { $ne: true }, dueOn: { $lt: new Date() } },
    (doc) => ({ ...doc, isOverdue: true })
  );
};

export const cron = '0 9 * * *';
```

---

## 🔄 Auto-Sync

Embedded documents stay fresh. When a user updates their name, all tasks with that user update automatically.

```json
{
  "tasks": {
    "assignee": { "schema": "users" }
  }
}
```

---

## CLI

```bash
hive init [name]      # Create new project
hive run [path]       # Start dev server
hive prepare [path]   # Build for production
hive deploy           # Deploy to Hive Cloud
hive install <plugin> # Install plugin
hive login            # Login to Hive Cloud
```

---

## Project Structure

```
my-app/
├── src/
│   ├── resources/        # Your features
│   ├── middlewares/      # Custom middlewares
│   ├── services/         # External APIs
│   └── scheduler/handlers/
└── .hive/                # Framework (don't edit)
```

---

## Tech Stack

Proven, boring technology:

- **Koa** — Node.js framework
- **MongoDB** — Document database
- **Zod** — Schema validation
- **Socket.io** — Real-time
- **BullMQ** — Job queues
- **Redis** — Cache & pub/sub