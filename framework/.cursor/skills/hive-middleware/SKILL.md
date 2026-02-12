---
name: hive-middleware
description: How to create and use middlewares in Hive framework
globs:
  - src/middlewares/*.js
alwaysApply: false
---

# Middlewares

Location: `/src/middlewares/{name}.js`

## Built-in Middlewares

| Name | Purpose |
|------|---------|
| `allowNoAuth` | Skip authentication |
| `isAuthorized` | Require authenticated user |
| `shouldExist` | Load resource, 404 if not found |
| `attachUser` | Load user from token |

## Creating Middleware

**Simple:**
```javascript
export default async (ctx, next) => {
  // Before handler
  if (!ctx.state.user?.isAdmin) {
    ctx.throw(403, 'Admin only');
  }
  return next();  // Don't forget!
};
```

**With parameters:**
```javascript
export default (resourceName) => async (ctx, next) => {
  const doc = await db.services[resourceName].findOne({
    _id: ctx.params[`${resourceName}Id`],
  });
  
  if (!doc) ctx.throw(404, `${resourceName} not found`);
  
  ctx.state[resourceName] = doc;
  return next();
};
```

**With runOrder (lower runs first):**
```javascript
const middleware = async (ctx, next) => {
  ctx.state.isSkipAuth = true;
  return next();
};
middleware.runOrder = -1;
export default middleware;
```

## Using in Endpoints

```javascript
// By name
export const middlewares = ['allowNoAuth'];

// With arguments
export const middlewares = [{ name: 'shouldExist', args: ['projects'] }];

// Direct import
import isAdmin from 'middlewares/isAdmin';
export const middlewares = [isAdmin];

// Factory function
import canEditProject from 'middlewares/canEditProject';
export const middlewares = [canEditProject((ctx) => ctx.params.projectId)];

// Inline
export const middlewares = [
  async (ctx, next) => {
    // Custom logic
    return next();
  },
];
```

## Global Middleware

Create `/src/middlewares/global.js` to run on all endpoints:

```javascript
import isAuthorized from 'middlewares/isAuthorized';
import attachRootProject from 'middlewares/attachRootProject';

export default async (ctx, next) => {
  await isAuthorized(ctx, async () => {
    await attachRootProject(ctx, next);
  });
};
```

## Rules

- Always call `next()` or throw
- Use `runOrder` to control execution order
- Factory functions for parameterized middlewares
