const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function getThreadHistory(threadID, amount, timestamp, callback) {
    if (!callback) {
      throw new Error('getThreadHistory: need callback');
    }

    const form = {
      client: 'mercury',
    };

    api.getUserInfo(threadID, (err, res) => {
      if (err) {
        return callback(err);
      }
      const key = (Object.keys(res).length > 0) ? 'user_ids' : 'thread_fbids';
      form[`messages[${key}][${threadID}][offset]`] = 0;
      form[`messages[${key}][${threadID}][timestamp]`] = timestamp;
      form[`messages[${key}][${threadID}][limit]`] = amount;

      if (ctx.globalOptions.pageID) form.request_user_id = ctx.globalOptions.pageID;

      return defaultFuncs.post('https://www.facebook.com/ajax/mercury/thread_info.php', ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then((resData) => {
          if (resData.error) {
            throw resData;
          } else if (!resData.payload) {
            throw new Error('Could not retrieve thread history.');
          }

          // Asking for message history from a thread with no message history
          // will return undefined for actions here
          const actions = resData.payload.actions || [];

          const userIDs = {};
          actions.forEach((v) => {
            userIDs[v.author.split(':').pop()] = '';
          });

          api.getUserInfo(Object.keys(userIDs), (err2, data) => {
            // callback({error: "Could not retrieve user information in getThreadHistory."});
            if (err2) return callback(err2);

            actions.forEach((action) => {
              const v = action;
              const sender = data[v.author.split(':').pop()];
              if (sender) v.sender_name = sender.name;
              else v.sender_name = 'Facebook User';
              v.sender_fbid = v.author;
              delete v.author;
            });

            return callback(null, actions.map(utils.formatHistoryMessage));
          });
        })
        .catch((err2) => {
          log.error('getThreadHistory', err2);
          return callback(err2);
        });
    });
  };
};
