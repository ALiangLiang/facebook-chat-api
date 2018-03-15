

const utils = require('../utils');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function deleteThread(threadOrThreads, callback) {
    if (!callback) {
      callback = function () {};
    }

    const form = {
      client: 'mercury',
    };

    if (utils.getType(threadOrThreads) !== 'Array') {
      threadOrThreads = [threadOrThreads];
    }

    for (let i = 0; i < threadOrThreads.length; i++) {
      form[`ids[${i}]`] = threadOrThreads[i];
    }

    defaultFuncs
      .post('https://www.facebook.com/ajax/mercury/delete_thread.php', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('deleteThread', err);
        return callback(err);
      });
  };
};
