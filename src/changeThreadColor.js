const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function changeThreadColor(color, threadID, callback = emptyFunc) {
    // API only accepts lowercase letters in hex string
    const validatedColor = (color !== null) ? color.toLowerCase() : color;
    const colorList = Object.keys(api.threadColors).map(name => api.threadColors[name]);
    if (!colorList.includes(validatedColor)) {
      throw new Error('The color you are trying to use is not a valid thread color. Use api.threadColors to find acceptable values.');
    }

    const form = {
      color_choice: validatedColor,
      thread_or_other_fbid: threadID,
    };

    defaultFuncs
      .post('https://www.messenger.com/messaging/save_thread_color/?source=thread_settings&dpr=1', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error === 1357031) {
          throw new Error('Trying to change colors of a chat that doesn\'t exist. Have at least one message in the thread before trying to change the colors.');
        }
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch((err) => {
        log.error('changeThreadColor', err);
        return callback(err);
      });
  };
};
