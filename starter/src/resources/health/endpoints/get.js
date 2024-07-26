import { render } from '@react-email/render';
import { MyEmailComponent } from 'emails/compiled/MyEmailComponent';
import React from 'react';

export const handler = (ctx) => {
  const emailHtml = render(React.createElement(MyEmailComponent, { name: 'test' }));

  ctx.body = emailHtml;
  ctx.status = 200;
};

export const endpoint = {
  method: "get",
  url: "/",
};

export default {
  handler, endpoint
}
