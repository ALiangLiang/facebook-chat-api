

const utils = require('../utils');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function changeThreadEmoji(emoji, threadID, callback) {
    if (!callback) {
      callback = function () {};
    }
    const form = {
      emoji_choice: emoji,
      thread_or_other_fbid: threadID,
    };

    defaultFuncs
      .post('https://www.messenger.com/messaging/save_thread_emoji/?source=thread_settings&__pc=EXP1%3Amessengerdotcom_pkg', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error === 1357031) {
          throw { error: "Trying to change emoji of a chat that doesn't exist. Have at least one message in the thread before trying to change the emoji." };
        }
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('changeThreadEmoji', err);
        return callback(err);
      });
  };
};
