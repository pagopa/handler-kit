const customRules = require("@pagopa/danger-plugin");

const recordScope = {
  projectToScope: {},
  tagToScope: {},
};

customRules(recordScope);
