const moment = require("moment");

module.exports.cron = "* * * * *";

module.exports.handler = () => {
  const yesterday = moment().add(-1, "day").toDate();
};
