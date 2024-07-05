import render$0 from "@react-email/render";
import myEmailComponent from "emails/compiled/MyEmailComponent";
import React from "react";
const { render } = render$0;
const { MyEmailComponent } = myEmailComponent;
const handler = (ctx) => {
    const emailHtml = render(React.createElement(MyEmailComponent, { name: "test" }));
    ctx.body = emailHtml;
    ctx.status = 200;
};
export const endpoint = {
    method: "get",
    url: "/",
};
export { handler };
