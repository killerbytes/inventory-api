const jwt = require("jsonwebtoken");
const { authStorage } = require("../services/auth.service");

const verifyToken = (options = {}) => {
  return (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      options.maxAge ? { maxAge: options.maxAge } : {},
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (options.scope && decoded.scope !== options.scope) {
          return res.status(403).json({ message: "Invalid token scope" });
        }

        if (options.adminOnly && decoded.role !== "Admin") {
          return res.status(403).json({ message: "Admin access required" });
        }

        if (options.requiredPermission) {
          const requiredRoles = Array.isArray(options.requiredPermission)
            ? options.requiredPermission
            : [options.requiredPermission];
          
          if (!requiredRoles.includes(decoded.role) && decoded.role !== "Admin") {
            return res.status(403).json({ message: "Insufficient role permission" });
          }
        }

        if (options.requirePermissions) {
          const userPerms = decoded.permissions || [];
          const hasAll = userPerms.includes("*");
          // Require at least one of the required permissions to pass, or require all?
          // Usually, you might want to require ALL permissions listed or ANY.
          // Let's implement require EVERY permission listed.
          const hasRequired = options.requirePermissions.every((p) =>
            userPerms.includes(p)
          );
          if (!hasAll && !hasRequired) {
            return res.status(403).json({ message: "Insufficient permissions" });
          }
        }

        req.userId = decoded.id;

        authStorage.run({ userId: decoded.id }, () => {
          next();
        });
      }
    );
  };
};

module.exports = verifyToken;
