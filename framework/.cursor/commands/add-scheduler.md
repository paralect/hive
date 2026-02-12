# Add Scheduler

Creates a new scheduled background job.

## Command Format

```
add-scheduler {name} [{schedule}]
```

**Examples:**
- `add-scheduler syncExternalData every 5 minutes`
- `add-scheduler sendDailyReport daily at 9am`
- `add-scheduler markOverdueInvoices every day at midnight`
- `add-scheduler weeklyCleanup every monday at 3am`

## Schedule to Cron

Translate natural language to cron:

| User says | Cron |
|-----------|------|
| every minute | `* * * * *` |
| every 5 minutes | `*/5 * * * *` |
| every hour | `0 * * * *` |
| every 6 hours | `0 */6 * * *` |
| daily at midnight | `0 0 * * *` |
| daily at 9am | `0 9 * * *` |
| every monday at 9am | `0 9 * * 1` |
| first of month | `0 0 1 * *` |

## Location

`src/scheduler/handlers/{name}.js`

## Template

```javascript
import db from 'db';

export const handler = async () => {
  // Job logic here
};

export const cron = '0 * * * *'; // Every hour
```

## Examples

### Sync external data

```javascript
import db from 'db';
import moment from 'moment';
import externalApi from 'services/externalApi';

const itemsService = db.services.items;

export const handler = async () => {
  const items = await externalApi.list({
    updatedSince: moment().subtract(5, 'minutes').toDate(),
  });

  for (const item of items) {
    await itemsService.updateOne(
      { externalId: item.id },
      (doc) => ({ ...doc, ...item })
    );
  }
};

export const cron = '*/5 * * * *';
```

### Send daily report

```javascript
import db from 'db';
import slack from 'services/slack';

const tasksService = db.services.tasks;

export const handler = async () => {
  const { count: completed } = await tasksService.find({ status: 'completed' });
  const { count: pending } = await tasksService.find({ status: 'pending' });

  await slack.sendChannelMessage({
    channel: '#reports',
    text: `Daily report: ${completed} completed, ${pending} pending`,
  });
};

export const cron = '0 9 * * *';
```

### Mark overdue invoices

```javascript
import db from 'db';

const invoicesService = db.services.invoices;

export const handler = async () => {
  await invoicesService.updateMany(
    {
      isPaid: { $ne: true },
      isOverdue: { $ne: true },
      dueOn: { $lt: new Date() },
    },
    (doc) => ({ ...doc, isOverdue: true })
  );
};

export const cron = '0 0 * * *';
```

### Cleanup old records

```javascript
import db from 'db';
import moment from 'moment';

const logsService = db.services.logs;

export const handler = async () => {
  await logsService.remove({
    createdOn: { $lt: moment().subtract(30, 'days').toDate() },
  });
};

export const cron = '0 3 * * *';
```

## Tips

- Keep jobs idempotent (safe to re-run)
- Log progress for debugging
- Use `atomic.update` for bulk operations
