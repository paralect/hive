---
name: hive-service
description: How to create external services in Hive framework
globs:
  - src/services/*.js
alwaysApply: false
---

# Services

Services wrap external APIs and utilities.

Location: `/src/services/{name}.js`

## API Client Template

```javascript
import config from 'app-config';
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${config.example.apiKey}`,
  },
});

export default {
  getItems: async (params) => {
    const response = await client.get('/items', { params });
    return response.data;
  },
  
  createItem: async (data) => {
    const response = await client.post('/items', data);
    return response.data;
  },
};
```

## SDK Wrapper Template

```javascript
import config from 'app-config';
import { WebClient } from '@slack/web-api';

const client = new WebClient(config.slack.botToken);

export default {
  client,
  
  postMessage: async ({ channel, text }) => {
    return client.chat.postMessage({ channel, text });
  },
};
```

## Utility Service Template

```javascript
import _ from 'lodash';

export const when = (condition, result, elseResult = {}) => {
  if (_.isUndefined(condition)) return {};
  if (!condition) return elseResult;
  return _.isFunction(result) ? result() : result;
};

export const base64 = {
  encode: (obj) => Buffer.from(JSON.stringify(obj)).toString('base64'),
  decode: (str) => JSON.parse(Buffer.from(str, 'base64').toString()),
};
```

## Using Services

```javascript
import harvest from 'services/harvest';
import slackService from 'services/slack';
import { when } from 'services/utils';

// API calls
const invoices = await harvest.getInvoices({ projectId });

// SDK usage
await slackService.postMessage({ channel: '#general', text: 'Hello' });

// Utilities
const query = { ...when(status, { status }) };
```
