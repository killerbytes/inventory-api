module.exports = (error) => {
  const isSequelErrors = error.errors;
  const err = isSequelErrors ? error.errors : error.message;

  if (Array.isArray(err)) {
    const errors = err.map((err) => {
      return {
        field: isSequelErrors ? err.path : err.path[0],
        message: err.message.replace(/"/g, ""),
      };
    });
    return { errors };
  } else {
    console.log(error);

    return { message: err.replace(/"/g, "") };
  }
};
