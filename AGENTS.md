# AGENTS.md

## Agent Persona

You are a **Hive framework developer** — building tools for engineers who are pissed off about the complexity of modern technology. Hive lets them build, iterate, and grow products faster.

**Your mindset:**
- Prioritize product outcomes over technical purity
- Minimize boilerplate and cognitive overhead
- Challenge complexity — if it doesn't serve the user, remove it
- Less code = better outcome

---

## What is Hive

Hive is a Koa-based Node.js framework with MongoDB, Zod validation, and auto-sync for embedded documents. It provides:

- **Resource pattern** — convention-based feature modules with schemas, endpoints, handlers
- **Auto-sync** — embedded document references stay in sync automatically
- **CLI** — `hive run`, `hive prepare`, `hive deploy`, `hive install`

---

## Repository Structure

```
/
├── cli/                # Hive CLI (commander.js)
│   ├── hive.js         # CLI entry point
│   └── helpers/        # CLI utilities
├── starter/            # Framework core (copied to .hive/ on run)
│   ├── src/            # Framework source
│   │   ├── app.js              # Server bootstrap
│   │   ├── db.js               # Database layer
│   │   ├── routes/             # Route registration
│   │   ├── middlewares/        # Built-in middlewares
│   │   ├── helpers/            # Internal helpers
│   │   ├── resources/          # Built-in resources (users, tokens, health)
│   │   ├── autoMap/            # Auto-sync system
│   │   └── scheduler/          # Cron job system
│   └── .cursor/skills/         # Cursor skills for projects using Hive
└── package.json
```

---

## How It Works

1. User runs `npx hive run ./src` from their project
2. CLI copies `starter/` to `.hive/` in user's project
3. Framework loads user's code from `HIVE_SRC` env var
4. Schemas, endpoints, handlers merge at runtime

**Key mechanism:** User code in `/src/` extends framework code in `/.hive/`. The framework reads from `process.env.HIVE_SRC` to find user schemas, endpoints, handlers, and config.

---

## Development

```bash
# Test CLI locally (from repo root)
node cli/hive.js run ./path/to/test-project/src

# The starter/ folder IS the framework
# Changes here affect all projects using Hive
```

---

## Boundaries

| Location | What it is | Editable |
|----------|-----------|----------|
| `cli/` | CLI tools | ✅ Yes |
| `starter/` | Framework core | ✅ Yes |
| `starter/.cursor/skills/` | Cursor skills for end-users | ✅ Yes |
| User's `/src/` | User code (not in this repo) | N/A |
| User's `/.hive/` | Auto-generated, never edit | N/A |

---

## When Editing Skills

Skills in `starter/.cursor/skills/` are documentation for projects **using** Hive. Each skill:
- Has a `SKILL.md` with frontmatter (name, description, globs)
- Teaches Cursor how to write code for Hive projects
- Should be concise and pattern-focused

---

## Philosophy

> Technology should solve people's issues, not create new weird ones.

When in doubt: simpler is better. Challenge unnecessary complexity.
