const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function deleteThread(threadOrThreads, callback = emptyFunc) {
    const form = {
      client: 'mercury',
    };

    let threads = threadOrThreads;
    if (utils.getType(threadOrThreads) !== 'Array') {
      threads = [threadOrThreads];
    }

    for (let i = 0; i < threads.length; i += 1) {
      form[`ids[${i}]`] = threads[i];
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
