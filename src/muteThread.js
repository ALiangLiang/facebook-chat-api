const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  // muteSecond: -1=permanent mute, 0=unmute, 60=one minute, 3600=one hour, etc.
  return function muteThread(threadID, muteSeconds, callback = emptyFunc) {
    const form = {
      thread_fbid: threadID,
      mute_settings: muteSeconds,
    };

    defaultFuncs
      .post('https://www.facebook.com/ajax/mercury/change_mute_thread.php', ctx.jar, form)
      .then(utils.saveCookies(ctx.jar))
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('muteThread', err);
        return callback(err);
      });
  };
};
