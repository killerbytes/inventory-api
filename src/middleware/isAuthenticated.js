export default (req, res, next) => {
  const token = req.headers["x-access-token"];
  console.log("Token: ", token);
  return next();
  // if (token) {
  //   jwt.verify(token, secret_key, (err, decoded) => {
  //     if (err) {
  //       throw { status: 401, message: err.message };
  //     } else {
  //       req.CURRENT_USER = decoded;
  //       return next();
  //     }
  //   });
  // } else {
  //   throw { status: 401, message: "Unauthorized" };
  // }
};
