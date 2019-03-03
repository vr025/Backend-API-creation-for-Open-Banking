const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
  let errors = {};

  data.amount = !isEmpty(data.amount) ? data.amount : "";
  data.mode = !isEmpty(data.mode) ? data.mode : "";
  data.date = !isEmpty(data.date) ? data.date : "";

  if (Validator.isEmpty(data.amount)) {
    errors.amount = "Amount field is required";
  }

  if (Validator.isEmpty(data.mode)) {
    errors.mode = "Mode field is required";
  }

  if (Validator.isEmpty(data.date)) {
    errors.date = "Date field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
