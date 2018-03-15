const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function resolvePhotoUrl(photoID, callback) {
    if (!callback) {
      throw new Error('resolvePhotoUrl: need callback');
    }

    defaultFuncs
      .get('https://www.facebook.com/mercury/attachments/photo', ctx.jar, { photo_id: photoID })
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        const photoUrl = resData.jsmods.require[0][3][0];

        return callback(null, photoUrl);
      })
      .catch((err) => {
        log.error('resolvePhotoUrl', err);
        return callback(err);
      });
  };
};
