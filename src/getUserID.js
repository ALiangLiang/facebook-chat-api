

const utils = require('../utils');
const log = require('npmlog');

function formatData(data) {
  return {
    userID: utils.formatID(data.uid.toString()),
    photoUrl: data.photo,
    indexRank: data.index_rank,
    name: data.text,
    isVerified: data.is_verified,
    profileUrl: data.path,
    category: data.category,
    score: data.score,
    type: data.type,
  };
}

module.exports = function (defaultFuncs, api, ctx) {
  return function getUserID(name, callback) {
    if (!callback) {
      throw { error: 'getUserID: need callback' };
    }

    const form = {
      value: name.toLowerCase(),
      viewer: ctx.userID,
      rsp: 'search',
      context: 'search',
      path: '/home.php',
      request_id: utils.getGUID(),
    };

    defaultFuncs
      .get('https://www.facebook.com/ajax/typeahead/search.php', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }

        const data = resData.payload.entries;

        callback(null, data.map(formatData));
      })
      .catch((err) => {
        log.error('getUserID', err);
        return callback(err);
      });
  };
};
