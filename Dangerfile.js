const customRules = require("@pagopa/danger-plugin");

const recordScope = {
  projectToScope: {
    SFEQS: "Firma con IO"
  },
  tagToScope: {
    development: "Development",
    backend: "Backend",
    dependency: "Dependency",
  },
};

customRules(recordScope);
