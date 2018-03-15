const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function addUserToGroup(userID, threadID, callback = function emptyFunc() {}) {
    if (!callback && (utils.getType(threadID) === 'Function' || utils.getType(threadID) === 'AsyncFunction')) {
      throw new Error('please pass a threadID as a second argument.');
    }

    if (utils.getType(threadID) !== 'Number' && utils.getType(threadID) !== 'String') {
      throw new Error(`ThreadID should be of type Number or String and not ${utils.getType(threadID)}.`);
    }

    let userIDs = userID;
    if (utils.getType(userID) !== 'Array') {
      userIDs = [userID];
    }

    const messageAndOTID = utils.generateOfflineThreadingID();
    const form = {
      client: 'mercury',
      action_type: 'ma-type:log-message',
      author: `fbid:${ctx.userID}`,
      thread_id: '',
      timestamp: Date.now(),
      timestamp_absolute: 'Today',
      timestamp_relative: utils.generateTimestampRelative(),
      timestamp_time_passed: '0',
      is_unread: false,
      is_cleared: false,
      is_forward: false,
      is_filtered_content: false,
      is_filtered_content_bh: false,
      is_filtered_content_account: false,
      is_spoof_warning: false,
      source: 'source:chat:web',
      'source_tags[0]': 'source:chat',
      log_message_type: 'log:subscribe',
      status: '0',
      offline_threading_id: messageAndOTID,
      message_id: messageAndOTID,
      threading_id: utils.generateThreadingID(ctx.clientID),
      manual_retry_cnt: '0',
      thread_fbid: threadID,
    };

    for (let i = 0; i < userIDs.length; i += 1) {
      if (utils.getType(userIDs[i]) !== 'Number' && utils.getType(userIDs[i]) !== 'String') {
        throw new Error(`Elements of userID should be of type Number or String and not ${utils.getType(userIDs[i])}.`);
      }

      form[`log_message_data[added_participants][${i}]`] = `fbid:${userIDs[i]}`;
    }

    defaultFuncs.post('https://www.facebook.com/messaging/send/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (!resData) {
          throw new Error('Add to group failed.');
        }
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('addUserToGroup', err);
        return callback(err);
      });
  };
};
