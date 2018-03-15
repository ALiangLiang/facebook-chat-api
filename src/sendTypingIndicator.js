const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  function makeTypingIndicator(typ, threadID, callback) {
    const form = {
      typ: +typ,
      to: '',
      source: 'mercury-chat',
      thread: threadID,
    };

    // Check if thread is a single person chat or a group chat
    // More info on this is in api.sendMessage
    api.getUserInfo(threadID, (err, res) => {
      if (err) {
        return callback(err);
      }

      // If id is single person chat
      if (Object.keys(res).length > 0) {
        form.to = threadID;
      }

      return defaultFuncs
        .post('https://www.facebook.com/ajax/messaging/typ.php', ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then((resData) => {
          if (resData.error) {
            throw resData;
          }

          return callback();
        })
        .catch((err2) => {
          log.error('sendTypingIndicator', err2);
          return callback(err2);
        });
    });
  }

  return function sendTypingIndicator(threadID, cb) {
    let callback = cb;
    if (utils.getType(cb) !== 'Function' && utils.getType(cb) !== 'AsyncFunction') {
      if (cb) {
        log.warn('sendTypingIndicator', 'callback is not a function - ignoring.');
      }
      callback = () => {};
    }

    makeTypingIndicator(true, threadID, callback);

    return function end(cb2) {
      let callback2 = cb2;
      if (utils.getType(cb2) !== 'Function' && utils.getType(cb2) !== 'AsyncFunction') {
        if (cb2) {
          log.warn('sendTypingIndicator', 'callback is not a function - ignoring.');
        }
        callback2 = () => {};
      }

      makeTypingIndicator(false, threadID, callback2);
    };
  };
};
