# Add Service

Creates a new service for external APIs or utilities.

## Command Format

```
add-service {name} [{methods}]
```

**Examples:**
- `add-service slack sendChannelMessage, replyToThread`
- `add-service stripe createCustomer, createPaymentIntent, listInvoices`
- `add-service openai chat, generateImage`
- `add-service sendgrid sendEmail, sendTemplateEmail`

## Location

`src/services/{name}.js`

## Known Services & Libraries

When creating a service, use these go-to libraries:

| Service | Library | Install |
|---------|---------|---------|
| Slack | `@slack/web-api` | `npm i @slack/web-api` |
| Stripe | `stripe` | `npm i stripe` |
| OpenAI | `openai` | `npm i openai` |
| SendGrid | `@sendgrid/mail` | `npm i @sendgrid/mail` |
| Twilio | `twilio` | `npm i twilio` |
| AWS S3 | `@aws-sdk/client-s3` | `npm i @aws-sdk/client-s3` |
| Resend | `resend` | `npm i resend` |
| Postmark | `postmark` | `npm i postmark` |

## Template

```javascript
import config from 'app-config';

// Initialize client here

export default {
  client,

  // Methods here
};
```

## Full Examples

### `add-service slack sendChannelMessage, replyToThread`

```javascript
import config from 'app-config';
import { WebClient } from '@slack/web-api';

const client = new WebClient(config.slack.botToken);

export default {
  client,

  sendChannelMessage: async ({ channel, text, blocks }) => {
    return client.chat.postMessage({ channel, text, blocks });
  },

  replyToThread: async ({ channel, threadTs, text }) => {
    return client.chat.postMessage({ channel, text, thread_ts: threadTs });
  },
};
```

### `add-service stripe createCustomer, createPaymentIntent, listInvoices`

```javascript
import config from 'app-config';
import Stripe from 'stripe';

const client = new Stripe(config.stripe.secretKey);

export default {
  client,

  createCustomer: async ({ email, name, metadata }) => {
    return client.customers.create({ email, name, metadata });
  },

  createPaymentIntent: async ({ amount, currency, customerId }) => {
    return client.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
    });
  },

  listInvoices: async ({ customerId, limit = 10 }) => {
    return client.invoices.list({ customer: customerId, limit });
  },
};
```

### `add-service openai chat, generateImage`

```javascript
import config from 'app-config';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: config.openai.apiKey });

export default {
  client,

  chat: async ({ messages, model = 'gpt-4' }) => {
    const response = await client.chat.completions.create({ model, messages });
    return response.choices[0].message;
  },

  generateImage: async ({ prompt, size = '1024x1024' }) => {
    const response = await client.images.generate({ prompt, size, n: 1 });
    return response.data[0].url;
  },
};
```

### `add-service sendgrid sendEmail, sendTemplateEmail`

```javascript
import config from 'app-config';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(config.sendgrid.apiKey);

export default {
  sendEmail: async ({ to, from, subject, html }) => {
    return sgMail.send({ to, from, subject, html });
  },

  sendTemplateEmail: async ({ to, from, templateId, dynamicTemplateData }) => {
    return sgMail.send({ to, from, templateId, dynamicTemplateData });
  },
};
```

### `add-service s3 upload, getSignedUrl, delete`

```javascript
import config from 'app-config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export default {
  client,

  upload: async ({ bucket, key, body, contentType }) => {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType });
    return client.send(command);
  },

  getSignedUrl: async ({ bucket, key, expiresIn = 3600 }) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn });
  },

  delete: async ({ bucket, key }) => {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    return client.send(command);
  },
};
```

## Usage

```javascript
import slack from 'services/slack';
import stripe from 'services/stripe';

await slack.sendChannelMessage({ channel: '#general', text: 'Hello' });

const customer = await stripe.createCustomer({ email: 'user@example.com' });
```
