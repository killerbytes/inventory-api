const { AsyncLocalStorage } = require('async_hooks');
const authContext = new AsyncLocalStorage();
module.exports = { authContext };
