const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function changeNickname(nickname, threadID, participantID, callback = emptyFunc) {
    const form = {
      nickname,
      participant_id: participantID,
      thread_or_other_fbid: threadID,
    };

    defaultFuncs
      .post('https://www.messenger.com/messaging/save_thread_nickname/?source=thread_settings&dpr=1', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error === 1545014) {
          throw new Error('Trying to change nickname of user isn\'t in thread');
        }
        if (resData.error === 1357031) {
          throw new Error('Trying to change user nickname of a thread that doesn\'t exist. Have at least one message in the thread before trying to change the user nickname.');
        }
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('changeNickname', err);
        return callback(err);
      });
  };
};
