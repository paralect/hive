const { render } = require('@react-email/render');
const { MyEmailComponent } = require('emails/dist/MyEmailComponent'); 
const React = require('react');

const handler = (ctx) => {
  const emailHtml = render(React.createElement(MyEmailComponent, { name: 'test' }));

  ctx.body = emailHtml;
  ctx.status = 200;
};

module.exports.handler = handler;

module.exports.endpoint = {
  method: "get",
  url: "/",
};
