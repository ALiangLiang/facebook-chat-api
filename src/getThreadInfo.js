const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function getThreadInfo(threadID, callback = emptyFunc) {
    const form = {
      client: 'mercury',
    };

    api.getUserInfo(threadID, (err, userRes) => {
      if (err) {
        return callback(err);
      }
      const key = (Object.keys(userRes).length > 0) ? 'user_ids' : 'thread_fbids';
      form[`threads[${key}][0]`] = threadID;

      if (ctx.globalOptions.pageId) form.request_user_id = ctx.globalOptions.pageId;

      return defaultFuncs.post('https://www.facebook.com/ajax/mercury/thread_info.php', ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then((resData) => {
          if (resData.error) {
            throw resData;
          } else if (!resData.payload) {
            throw new Error('Could not retrieve thread Info.');
          }
          const threadData = resData.payload.threads[0];
          const userData = userRes[threadID];

          if (threadData == null) {
            throw new Error('ThreadData is null');
          }

          threadData.name = userData != null && userData.name != null
            ? userData.name
            : threadData.name;
          threadData.image_src = userData != null && userData.thumbSrc != null
            ? userData.thumbSrc
            : threadData.image_src;

          callback(null, utils.formatThread(threadData));
        }).catch((err2) => {
          log.error('getThreadInfo', err2);
          return callback(err2);
        });
    });
  };
};
