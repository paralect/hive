---
name: hive-schema
description: How to create database schemas in Hive framework
globs:
  - src/resources/**/*.schema.js
alwaysApply: false
---

# Creating Database Schemas

Location: `/src/resources/{name}/{name}.schema.js`

## Template

```javascript
import { z } from 'zod';
import dbSchema from 'helpers/schema/db.schema.js';

const schema = dbSchema.extend({
  // Fields here
});

export default schema;

export const secureFields = []; // Hidden from API responses
```

## Field Patterns

**Simple fields:**
```javascript
title: z.coerce.string().nullable().optional(),
count: z.coerce.number().nullable().optional(),
isActive: z.coerce.boolean().nullable().optional(),
dueOn: z.coerce.date().nullable().optional(),
```

**Reference to another document:**
```javascript
user: z
  .object({
    _id: z.string(),
    fullName: z.coerce.string().nullable().optional(),
    avatarUrl: z.coerce.string().nullable().optional(),
  })
  .nullable()
  .optional(),
```

**Array of references:**
```javascript
managers: z
  .array(
    z.object({
      _id: z.string(),
      fullName: z.coerce.string().nullable().optional(),
    }).nullable().optional(),
  )
  .nullable()
  .optional(),
```

**Flexible object:**
```javascript
data: z.object({}).passthrough().nullable().optional(),
```

## Rules

- Always use `z.coerce` for type safety
- Always add `.nullable().optional()` unless required
- Include fields you need in references (for auto-sync)
- Add sensitive fields to `secureFields` array
