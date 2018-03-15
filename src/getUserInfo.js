const utils = require('../utils');
const log = require('npmlog');

function formatData(data) {
  const retObj = {};

  Object.keys(data).forEach((prop) => {
    if (Object.hasOwnProperty.call(data, prop)) {
      const innerObj = data[prop];
      retObj[prop] = {
        name: innerObj.name,
        firstName: innerObj.firstName,
        vanity: innerObj.vanity,
        thumbSrc: innerObj.thumbSrc,
        profileUrl: innerObj.uri,
        gender: innerObj.gender,
        type: innerObj.type,
        isFriend: innerObj.is_friend,
        isBirthday: !!innerObj.is_birthday,
      };
    }
  });

  return retObj;
}

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function getUserInfo(id, callback) {
    if (!callback) {
      throw new Error('getUserInfo: need callback');
    }

    let ids = id;
    if (utils.getType(id) !== 'Array') {
      ids = [id];
    }

    const form = {};
    ids.forEach((v, i) => {
      form[`ids[${i}]`] = v;
    });
    defaultFuncs.post('https://www.facebook.com/chat/user_info/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }
        return callback(null, formatData(resData.payload.profiles));
      })
      .catch((err) => {
        log.error('getUserInfo', err);
        return callback(err);
      });
  };
};
