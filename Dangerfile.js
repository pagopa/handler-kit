const customRules = require("@pagopa/danger-plugin").default;

const recordScope = {
  projectToScope: {
  },
  tagToScope: {
  },
  minLenPrDescription: 10,
  updateLabel: false,
  updateTitle: false,
};

customRules(recordScope);
