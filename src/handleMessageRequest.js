

const utils = require('../utils');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function handleMessageRequest(threadID, accept, callback) {
    if (utils.getType(accept) !== 'Boolean') {
      throw {
        error: 'Please pass a boolean as a second argument.',
      };
    }

    if (!callback) {
      callback = function () {};
    }

    const form = {
      client: 'mercury',
    };

    if (utils.getType(threadID) !== 'Array') {
      threadID = [threadID];
    }

    const messageBox = accept ? 'inbox' : 'other';

    for (let i = 0; i < threadID.length; i++) {
      form[`${messageBox}[${i}]`] = threadID[i];
    }

    defaultFuncs
      .post('https://www.facebook.com/ajax/mercury/move_thread.php', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('handleMessageRequest', err);
        return callback(err);
      });
  };
};
