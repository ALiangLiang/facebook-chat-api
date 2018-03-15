

const utils = require('../utils');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function removeUserFromGroup(userID, threadID, callback) {
    if (!callback && (utils.getType(threadID) === 'Function' || utils.getType(threadID) === 'AsyncFunction')) {
      throw { error: 'please pass a threadID as a second argument.' };
    }
    if (utils.getType(threadID) !== 'Number' && utils.getType(threadID) !== 'String') {
      throw { error: `threadID should be of type Number or String and not ${utils.getType(threadID)}.` };
    }
    if (utils.getType(userID) !== 'Number' && utils.getType(userID) !== 'String') {
      throw { error: `userID should be of type Number or String and not ${utils.getType(userID)}.` };
    }

    if (!callback) {
      callback = function () {};
    }

    const form = {
      uid: userID,
      tid: threadID,
    };

    defaultFuncs
      .post('https://www.facebook.com/chat/remove_participants', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (!resData) {
          throw { error: 'Remove from group failed.' };
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
