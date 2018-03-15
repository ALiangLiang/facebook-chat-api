const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function getThreadList(start, ed, tp, cb) {
    let end = ed;
    let type = tp;
    let callback = cb;
    if (utils.getType(callback) === 'Undefined') {
      if (utils.getType(end) !== 'Number') {
        throw new Error('Please pass a number as a second argument.');
      } else if (utils.getType(type) === 'Function' || utils.getType(type) === 'AsyncFunction') {
        callback = type;
        type = 'inbox'; // default to inbox
      } else if (utils.getType(type) !== 'String') {
        throw new Error('Please pass a String as a third argument. Your options are: inbox, pending, and archived');
      } else {
        throw new Error('getThreadList: need callback');
      }
    }

    if (type === 'archived') {
      type = 'action:archived';
    } else if (type !== 'inbox' && type !== 'pending' && type !== 'other') {
      throw new Error('type can only be one of the following: inbox, pending, archived, other');
    }

    if (end <= start) end = start + 20;

    const form = {
      client: 'mercury',
    };

    form[`${type}[offset]`] = start;
    form[`${type}[limit]`] = end - start;

    if (ctx.globalOptions.pageID) {
      form.request_user_id = ctx.globalOptions.pageID;
    }

    defaultFuncs
      .post('https://www.facebook.com/ajax/mercury/threadlist_info.php', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }
        log.verbose('getThreadList', JSON.stringify(resData.payload.threads));
        return callback(null, (resData.payload.threads || []).map(utils.formatThread));
      })
      .catch((err) => {
        log.error('getThreadList', err);
        return callback(err);
      });
  };
};
