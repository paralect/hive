const _ = require("lodash");

module.exports = (fieldNames, callback) => {
  return async ({ doc, prevDoc }) => {
    let isFieldChanged = false;

    _.forEach(fieldNames, (fieldName) => {
      if (!_.isEqual(doc[fieldName], prevDoc[fieldName])) {
        isFieldChanged = true;
        return false; // break loop
      }

      return true;
    });

    if (isFieldChanged) {
      return callback({ doc, prevDoc });
    }

    return () => {};
  };
};
