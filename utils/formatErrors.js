module.exports = (error) => {
  const isSequelErrors = error.errors;
  const err = isSequelErrors ? error.errors : error.details;

  const errors = err.map((err) => {
    return {
      field: isSequelErrors ? err.path : err.path[0],
      message: err.message.replace(/"/g, ""),
    };
  });

  return { errors };
};
