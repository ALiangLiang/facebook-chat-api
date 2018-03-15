const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function removeUserFromGroup(userID, threadID, cb) {
    if (!cb && (utils.getType(threadID) === 'Function' || utils.getType(threadID) === 'AsyncFunction')) {
      throw new Error('please pass a threadID as a second argument.');
    }
    if (utils.getType(threadID) !== 'Number' && utils.getType(threadID) !== 'String') {
      throw new Error(`threadID should be of type Number or String and not ${utils.getType(threadID)}.`);
    }
    if (utils.getType(userID) !== 'Number' && utils.getType(userID) !== 'String') {
      throw new Error(`userID should be of type Number or String and not ${utils.getType(userID)}.`);
    }

    const callback = cb || emptyFunc;

    const form = {
      uid: userID,
      tid: threadID,
    };

    defaultFuncs
      .post('https://www.facebook.com/chat/remove_participants', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (!resData) {
          throw new Error('Remove from group failed.');
        }
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('removeUserFromGroup', err);
        return callback(err);
      });
  };
};
