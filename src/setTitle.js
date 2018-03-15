

const utils = require('../utils');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function setTitle(newTitle, threadID, callback) {
    if (!callback && (utils.getType(threadID) === 'Function' || utils.getType(threadID) === 'AsyncFunction')) {
      throw { error: 'please pass a threadID as a second argument.' };
    }

    if (!callback) {
      callback = function () {};
    }

    const messageAndOTID = utils.generateOfflineThreadingID();
    const form = {
      client: 'mercury',
      action_type: 'ma-type:log-message',
      author: `fbid:${ctx.userID}`,
      thread_id: '',
      author_email: '',
      coordinates: '',
      timestamp: Date.now(),
      timestamp_absolute: 'Today',
      timestamp_relative: utils.generateTimestampRelative(),
      timestamp_time_passed: '0',
      is_unread: false,
      is_cleared: false,
      is_forward: false,
      is_filtered_content: false,
      is_spoof_warning: false,
      source: 'source:chat:web',
      'source_tags[0]': 'source:chat',
      status: '0',
      offline_threading_id: messageAndOTID,
      message_id: messageAndOTID,
      threading_id: utils.generateThreadingID(ctx.clientID),
      manual_retry_cnt: '0',
      thread_fbid: threadID,
      'log_message_data[name]': newTitle,
      log_message_type: 'log:thread-name',
    };

    defaultFuncs
      .post('https://www.facebook.com/messaging/send/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error && resData.error === 1545012) {
          throw { error: 'Cannot change chat title: Not member of chat.' };
        }

        if (resData.error && resData.error === 1545003) {
          throw { error: 'Cannot set title of single-user chat.' };
        }

        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('setTitle', err);
        return callback(err);
      });
  };
};
