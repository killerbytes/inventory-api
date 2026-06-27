const { GraphQLError } = require("graphql");
const { getRolePermissions, PERMISSIONS } = require("../config/roles");

function requireAuth(resolver) {
  return async (parent, args, context, info) => {
    if (!context.user) {
      throw new GraphQLError("No auth context", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return resolver(parent, args, context, info);
  };
}

function requirePermission(permission, resolver) {
  return async (parent, args, context, info) => {
    if (!context.user) {
      throw new GraphQLError("No auth context", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const permissions = getRolePermissions(context.user.role) || [];
    
    if (!permissions.includes(permission) && !permissions.includes(PERMISSIONS.ALL)) {
      throw new GraphQLError("Forbidden: Insufficient permissions", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    return resolver(parent, args, context, info);
  };
}

module.exports = {
  requireAuth,
  requirePermission,
};
