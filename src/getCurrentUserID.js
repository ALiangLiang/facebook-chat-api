module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function getCurrentUserID() {
    return ctx.userID;
  };
};
