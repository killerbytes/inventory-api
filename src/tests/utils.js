// src/tests/utils.js
function getConstraintFields(err) {
  if (!err || !err.fields) return [];
  return Array.isArray(err.fields) ? err.fields : Object.keys(err.fields);
}

module.exports = { getConstraintFields };
