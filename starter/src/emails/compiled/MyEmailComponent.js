import React from "react";
import _require from "@react-email/components";
("use strict");
var Html = _require.Html,
  Head = _require.Head,
  Body = _require.Body,
  Container = _require.Container,
  Heading = _require.Heading,
  Text = _require.Text;
var MyEmailComponent = function MyEmailComponent(_ref) {
  var name = _ref.name;
  return /*#__PURE__*/ React.createElement(
    Html,
    null,
    /*#__PURE__*/ React.createElement(Head, null),
    /*#__PURE__*/ React.createElement(
      Body,
      null,
      /*#__PURE__*/ React.createElement(
        Container,
        null,
        /*#__PURE__*/ React.createElement(Heading, null, "Hello, ", name, "!"),
        /*#__PURE__*/ React.createElement(
          Text,
          null,
          "This is a test email using @react-email and Express."
        )
      )
    )
  );
};
export { MyEmailComponent };
export default {
  MyEmailComponent: MyEmailComponent,
};
