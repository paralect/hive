# Add Handler

Creates a new event handler that reacts to database changes.

## Command Format

```
add-handler {resource}
```

**Examples:**
- `add-handler tasks`
- `add-handler invoices`
- `add-handler messages`

## Location

`src/resources/{resource}/handlers/{handlerName}.js`

## Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `created` | `{ doc }` | After `service.create()` |
| `updated` | `{ doc, prevDoc }` | After `service.updateOne/Many()` |
| `removed` | `{ doc }` | After `service.remove()` |

## Template

```javascript
import db from 'db';
import ifUpdated from 'helpers/db/ifUpdated';
// import ioEmitter from 'ioEmitter';

const {resource}Service = db.services.{resource};

{resource}Service.on('created', async ({ doc }) => {
});

{resource}Service.on('updated', ifUpdated(['field'], async ({ doc, prevDoc }) => {
}));

{resource}Service.on('removed', async ({ doc }) => {
});

/*
{resource}Service.on('created', async ({ doc }) => {
  ioEmitter.to(`room-${doc._id}`).emit('{resource}:created', { doc });
});
*/
```

## Examples

### React to specific field changes

```javascript
import db from 'db';
import ifUpdated from 'helpers/db/ifUpdated';

const tasksService = db.services.tasks;

tasksService.on('updated', ifUpdated(['status'], async ({ doc, prevDoc }) => {
  // Only runs when status changed
}));
```

### Emit socket event

```javascript
import db from 'db';
import ioEmitter from 'ioEmitter';

const messagesService = db.services.messages;

messagesService.on('created', async ({ doc: message }) => {
  ioEmitter.to(`project-${message.project._id}`).emit('message:created', {
    message,
  });
});
```

### Add related record

```javascript
import db from 'db';

const tasksService = db.services.tasks;
const notificationsService = db.services.notifications;

tasksService.on('created', async ({ doc }) => {
  if (!doc.assignee?._id) return;

  await notificationsService.create({
    user: doc.assignee,
    type: 'task.assigned',
    data: { task: doc },
  });
});
```

### Cleanup on delete

```javascript
import db from 'db';

const invoicesService = db.services.invoices;
const paymentsService = db.services.payments;

invoicesService.on('removed', async ({ doc }) => {
  await paymentsService.remove({ 'invoice._id': doc._id });
});
```

### Bulk update (silent, no events)

```javascript
import db from 'db';
import ifUpdated from 'helpers/db/ifUpdated';

const usersService = db.services.users;
const tasksService = db.services.tasks;

usersService.on('updated', ifUpdated(['fullName', 'avatarUrl'], async ({ doc }) => {
  await tasksService.atomic.update(
    { 'assignee._id': doc._id },
    { $set: { 'assignee.fullName': doc.fullName, 'assignee.avatarUrl': doc.avatarUrl } },
    { multi: true }
  );
}));
```

## Tips

- Use `ifUpdated` helper to react only when specific fields change
- Use `atomic.update` for bulk updates (no events triggered)
- Keep handlers fast — don't block the response
