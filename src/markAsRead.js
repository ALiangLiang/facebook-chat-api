const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function markAsRead(threadID, callback = emptyFunc) {
    const form = {};
    form[`ids[${threadID}]`] = true;
    form.watermarkTimestamp = new Date().getTime();
    form.shouldSendReadReceipt = true;
    form.commerce_last_message_type = 'non_ad';
    form.titanOriginatedThreadId = utils.generateThreadingID(ctx.clientID);

    defaultFuncs
      .post('https://www.facebook.com/ajax/mercury/change_read_status.php', ctx.jar, form)
      .then(utils.saveCookies(ctx.jar))
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('markAsRead', err);
        return callback(err);
      });
  };
};
