# Add Endpoint

Creates a new API endpoint with inferred types.

## Command Format

```
add-endpoint {resource} [{name}] {method} [{url}] {fields}
```

**Examples:**
- `add-endpoint tasks post title, description, dueOn`
- `add-endpoint tasks get page, perPage, status`
- `add-endpoint tasks update /:id title, status`
- `add-endpoint companies addMember put /:companyId/members user: { _id }, role`

## Method Aliases

| Alias | HTTP Method | Default Name | Default URL |
|-------|-------------|--------------|-------------|
| `get` | GET | list | / |
| `post`, `create` | POST | create | / |
| `put`, `update` | PUT | update | /:id |
| `delete` | DELETE | delete | /:id |

## Type Inference Rules

Infer Zod types from field names:

| Pattern | Zod Type |
|---------|----------|
| `is*`, `has*`, `can*` (e.g. `isEmpty`, `hasAccess`) | `z.coerce.boolean().nullable().optional()` |
| `*On`, `*At` (e.g. `dueOn`, `createdAt`) | `z.coerce.date().nullable().optional()` |
| `page`, `perPage`, `limit`, `offset`, `count`, `*Count` | `z.coerce.number().default(...)` |
| `entity: { _id }`, `entity: { _id, name }` | `z.object({ ... }).nullable().optional()` |
| Everything else | `z.coerce.string().nullable().optional()` |

## Important Rules

1. **Services are always plural:** `db.services.companies`, `db.services.tasks`
2. **URL params from ctx.params:** `:id`, `:companyId` come from `ctx.params`, NOT in requestSchema
3. **Entity references as objects:** Use `user: { _id }` not `userId`. Full object with `_id` field required.
4. **Use shouldExist middleware:** To load entities by ID, use `shouldExist` middleware, not `findOne`
5. **Write fields explicitly:** Don't use spread `...updates`, list each field

## Location

`src/resources/{resource}/endpoints/{name}.js`

## Full Examples

### `add-endpoint tasks post title, description, project: { _id }, dueOn`

Creates `src/resources/tasks/endpoints/create.js`:

```javascript
import { z } from 'zod';
import db from 'db';

const tasksService = db.services.tasks;

export const middlewares = [];

export const requestSchema = z.object({
  title: z.coerce.string().nullable().optional(),
  description: z.coerce.string().nullable().optional(),
  project: z.object({
    _id: z.string(),
  }).nullable().optional(),
  dueOn: z.coerce.date().nullable().optional(),
});

export const handler = async (ctx) => {
  const { title, description, project, dueOn } = ctx.validatedData;

  return tasksService.create({
    user: ctx.state.user,
    title,
    description,
    project,
    dueOn,
  });
};

export const endpoint = {
  url: '/',
  method: 'post',
};
```

### `add-endpoint tasks get page, perPage, status, isCompleted`

Creates `src/resources/tasks/endpoints/list.js`:

```javascript
import { z } from 'zod';
import db from 'db';

const tasksService = db.services.tasks;

export const middlewares = [];

export const requestSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
  status: z.coerce.string().nullable().optional(),
  isCompleted: z.coerce.boolean().nullable().optional(),
});

export const handler = async (ctx) => {
  const { page, perPage, status, isCompleted } = ctx.validatedData;

  return tasksService.find(
    { status, isCompleted },
    { page, perPage, sort: '-createdOn' }
  );
};

export const endpoint = {
  url: '/',
  method: 'get',
};
```

### `add-endpoint tasks update /:id title, status, assignee: { _id, fullName }`

Creates `src/resources/tasks/endpoints/update.js`:

```javascript
import { z } from 'zod';
import db from 'db';

const tasksService = db.services.tasks;

export const middlewares = [];

export const requestSchema = z.object({
  title: z.coerce.string().nullable().optional(),
  status: z.coerce.string().nullable().optional(),
  assignee: z.object({
    _id: z.string(),
  }).nullable().optional(),
});

export const handler = async (ctx) => {
  const { title, status, assignee } = ctx.validatedData;
  const { id } = ctx.params;

  return tasksService.updateOne(
    { _id: id },
    (doc) => ({
      ...doc,
      title,
      status,
      assignee,
    })
  );
};

export const endpoint = {
  url: '/:id',
  method: 'put',
};
```

### `add-endpoint companies addMember put /:companyId/members user: { _id }, role`

Creates `src/resources/companies/endpoints/addMember.js`:

```javascript
import { z } from 'zod';
import db from 'db';
import shouldExist from 'middlewares/shouldExist';

const companiesService = db.services.companies;

export const middlewares = [
  shouldExist('users', (ctx) => ctx.validatedData.user._id),
];

export const requestSchema = z.object({
  user: z.object({
    _id: z.string(),
  }),
  role: z.coerce.string().nullable().optional(),
});

export const handler = async (ctx) => {
  const { user, role } = ctx.validatedData;
  const { companyId } = ctx.params;

  return companiesService.updateOne(
    { _id: companyId },
    (doc) => ({
      ...doc,
      members: [...(doc.members || []), { _id: user._id, role }],
    })
  );
};

export const endpoint = {
  url: '/:companyId/members',
  method: 'put',
};
```

### `add-endpoint auth login post email, password` (public)

Creates `src/resources/auth/endpoints/login.js`:

```javascript
import { z } from 'zod';
import db from 'db';

const usersService = db.services.users;

export const middlewares = ['allowNoAuth'];

export const requestSchema = z.object({
  email: z.coerce.string(),
  password: z.coerce.string(),
});

export const handler = async (ctx) => {
  const { email, password } = ctx.validatedData;

  // Auth logic here
};

export const endpoint = {
  url: '/login',
  method: 'post',
};
```

### `add-endpoint tasks delete /:id`

Creates `src/resources/tasks/endpoints/delete.js`:

```javascript
import { z } from 'zod';
import db from 'db';

const tasksService = db.services.tasks;

export const middlewares = [];

export const requestSchema = z.object({});

export const handler = async (ctx) => {
  const { id } = ctx.params;

  await tasksService.remove({ _id: id });

  return { success: true };
};

export const endpoint = {
  url: '/:id',
  method: 'delete',
};
```
