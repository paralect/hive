# Add Middleware

Creates a new middleware for endpoints.

## Command Format

```
add-middleware {name}
```

**Examples:**
- `add-middleware isAdmin`
- `add-middleware canEditProject`
- `add-middleware rateLimit`

## Location

`src/middlewares/{name}.js`

## Template (simple)

```javascript
export default async (ctx, next) => {
  // Middleware logic here
  
  return next();
};
```

## Template (with parameters)

```javascript
export default (param) => async (ctx, next) => {
  // Use param here
  
  return next();
};
```

## Examples

### Access control

```javascript
export default async (ctx, next) => {
  if (!ctx.state.user?.isAdmin) {
    ctx.throw(403, 'Admin access required');
  }
  
  return next();
};
```

### With parameters

```javascript
import db from 'db';

export default (resource, getId = (ctx) => ctx.params.id) => async (ctx, next) => {
  const id = getId(ctx);
  const doc = await db.services[resource].findOne({ _id: id });
  
  if (!doc) {
    ctx.throw(404, `${resource} not found`);
  }
  
  ctx.state[resource] = doc;
  return next();
};
```

### With runOrder (lower runs first)

```javascript
const middleware = async (ctx, next) => {
  ctx.state.isSkipAuth = true;
  return next();
};

middleware.runOrder = -1;

export default middleware;
```

## Usage in endpoints

```javascript
// Import and use directly
import isAdmin from 'middlewares/isAdmin';
export const middlewares = [isAdmin];

// With parameters
import canEdit from 'middlewares/canEdit';
export const middlewares = [canEdit('projects', (ctx) => ctx.params.projectId)];
```
