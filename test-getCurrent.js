const db = require('./src/models');
const authService = require('./src/services/auth.service');

async function test() {
  const user = await db.User.findOne({ where: { username: 'admin' } });
  if (user) {
    const tokens = await authService.generateAuthTokens(user);
    console.log("AccessToken:", tokens.accessToken);
    
    // Now test the me query directly using the service
    try {
      const me = await authService.getCurrent(user);
      console.log("getCurrent successful:", me.username);
    } catch (err) {
      console.error("getCurrent failed:", err);
    }
  } else {
    console.log("Admin user not found");
  }
}

test().catch(console.error).finally(() => process.exit(0));
