const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function createPoll(title, threadID, ...optionsOrCallback) {
    let options = optionsOrCallback[0];
    let callback;
    if (optionsOrCallback[1]) {
      if (utils.getType(optionsOrCallback[0]) === 'Function') {
        [callback] = optionsOrCallback;
      } else {
        callback = emptyFunc;
      }
    }
    if (!options) {
      options = {}; // Initial poll options are optional
    }

    const form = {
      target_id: threadID,
      question_text: title,
    };

    // Set fields for options (and whether they are selected initially by the posting user)
    let ind = 0;
    Object.keys(options).forEach((opt) => {
      if (Object.hasOwnProperty.call(options, opt)) {
        form[`option_text_array[${ind}]`] = opt;
        form[`option_is_selected_array[${ind}]`] = (options[opt] ? '1' : '0');
        ind += 1;
      }
    });

    defaultFuncs
      .post('https://www.messenger.com/messaging/group_polling/create_poll/?dpr=1', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.payload.status !== 'success') {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('createPoll', err);
        return callback(err);
      });
  };
};
