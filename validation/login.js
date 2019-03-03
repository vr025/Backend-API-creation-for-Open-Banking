const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.AccountId = !isEmpty(data.AccountId) ? data.AccountId : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.AccountId)) {
    errors.AccountId = "Email field is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
