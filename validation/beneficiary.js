const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.relation = !isEmpty(data.relation) ? data.relation : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (Validator.isEmpty(data.relation)) {
    errors.relation = "Relation field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
