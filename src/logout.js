const utils = require('../utils');
const log = require('npmlog');

function emptyFunc() {}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function logout(callback = emptyFunc) {
    const form = {
      pmid: '0',
    };

    defaultFuncs
      .post('https://www.facebook.com/bluebar/modern_settings_menu/?help_type=364455653583099&show_contextual_help=1', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        const elem = resData.jsmods.instances[0][2][0].filter(v => v.value === 'logout')[0];

        const html = resData.jsmods.markup // eslint-disable-line no-underscore-dangle
          .filter(v => v[0] === elem.markup.__m)[0][1] // eslint-disable-line no-underscore-dangle
          .__html;

        const form2 = {
          fb_dtsg: utils.getFrom(html, '"fb_dtsg" value="', '"'),
          ref: utils.getFrom(html, '"ref" value="', '"'),
          h: utils.getFrom(html, '"h" value="', '"'),
        };

        return utils
          .post('https://www.facebook.com/logout.php', ctx.jar, form2)
          .then(utils.saveCookies(ctx.jar));
      })
      .then((res) => {
        if (!res.headers) {
          throw new Error('An error occurred when logging out.');
        }

        return utils
          .get(res.headers.location, ctx.jar)
          .then(utils.saveCookies(ctx.jar));
      })
      .then(() => {
        ctx.loggedIn = false;
        log.info('logout', 'Logged out successfully.');
        callback();
      })
      .catch((err) => {
        log.error('logout', err);
        return callback(err);
      });
  };
};
