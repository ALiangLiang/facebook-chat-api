const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function deleteMessage(messageOrMessages, callback = emptyFunc) {
    const form = {
      client: 'mercury',
    };

    let messages = messageOrMessages;
    if (utils.getType(messageOrMessages) !== 'Array') {
      messages = [messageOrMessages];
    }

    for (let i = 0; i < messages.length; i += 1) {
      form[`message_ids[${i}]`] = messages[i];
    }

    defaultFuncs
      .post('https://www.facebook.com/ajax/mercury/delete_messages.php', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('deleteMessage', err);
        return callback(err);
      });
  };
};
