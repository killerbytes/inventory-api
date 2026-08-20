const authService = require("../../services/auth.service");
const ApiError = require("../../services/ApiError");

describe("Auth Service Unit Tests - refreshAuth", () => {
  it("should throw ApiError.unauthorized when refreshToken is undefined or empty", async () => {
    await expect(authService.refreshAuth(undefined)).rejects.toThrow(ApiError);
    await expect(authService.refreshAuth(undefined)).rejects.toMatchObject({
      statusCode: 401,
      message: "Refresh token is required",
    });

    await expect(authService.refreshAuth("")).rejects.toThrow(ApiError);
    await expect(authService.refreshAuth("")).rejects.toMatchObject({
      statusCode: 401,
      message: "Refresh token is required",
    });
  });
});
