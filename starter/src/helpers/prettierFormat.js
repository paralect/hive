const prettier = require("prettier");

module.exports = (...params) => {
  return prettier.format(...params, {
    parser: "babel",
    singleQuote: true,
  });
};
