const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function forwardAttachment(attachmentID, userOrUsers, callback = emptyFunc) {
    const form = {
      attachment_id: attachmentID,
    };

    let users = userOrUsers;
    if (utils.getType(userOrUsers) !== 'Array') {
      users = [userOrUsers];
    }

    const timestamp = Math.floor(Date.now() / 1000);

    for (let i = 0; i < users.length; i += 1) {
      // That's good, the key of the array is really timestmap in seconds + index
      // Probably time when the attachment will be sent?
      form[`recipient_map[${timestamp + i}]`] = users[i];
    }

    defaultFuncs
      .post('https://www.messenger.com/mercury/attachments/forward/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx.jar, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        return callback(null);
      })
      .catch((err) => {
        log.error('forwardAttachment', err);
        return callback(err);
      });
  };
};
