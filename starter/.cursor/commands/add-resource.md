# Add Resource

Creates a complete resource with schema and folder structure.

## Steps

1. Create folder: `src/resources/{name}/`
2. Create schema file: `src/resources/{name}/{name}.schema.js`
3. Create folders: `endpoints/`, `handlers/`, `methods/`
4. Create first endpoint: `src/resources/{name}/endpoints/list.js`

## Schema Template

**File:** `src/resources/{name}/{name}.schema.js`

```javascript
import { z } from 'zod';
import dbSchema from 'helpers/schema/db.schema.js';

const schema = dbSchema.extend({
  // Add fields here
  title: z.coerce.string().nullable().optional(),
});

export default schema;

export const secureFields = [];
```

## First Endpoint Template

**File:** `src/resources/{name}/endpoints/list.js`

```javascript
import { z } from 'zod';
import db from 'db';

const {name}Service = db.services.{name};

export const middlewares = [];

export const requestSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
});

export const handler = async (ctx) => {
  const { page, perPage } = ctx.validatedData;

  return {name}Service.find(
    {},
    { page, perPage, sort: '-createdOn' }
  );
};

export const endpoint = {
  url: '/',
  method: 'get',
};
```

## Result

```
src/resources/{name}/
├── {name}.schema.js
├── endpoints/
│   └── list.js
├── handlers/
└── methods/
```
