const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function handleMessageRequest(threadID, accept, callback = emptyFunc) {
    if (utils.getType(accept) !== 'Boolean') {
      throw new Error('Please pass a boolean as a second argument.');
    }

    const form = {
      client: 'mercury',
    };

    let threadIDs = threadID;
    if (utils.getType(threadID) !== 'Array') {
      threadIDs = [threadID];
    }

    const messageBox = accept ? 'inbox' : 'other';

    for (let i = 0; i < threadIDs.length; i += 1) {
      form[`${messageBox}[${i}]`] = threadIDs[i];
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
