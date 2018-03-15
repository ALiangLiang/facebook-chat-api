const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function setMessageReaction(rc, messageID, callback = () => {}) {
    let reaction = rc;
    switch (reaction) {
      case '\uD83D\uDE0D': // :heart_eyes:
      case '\uD83D\uDE06': // :laughing:
      case '\uD83D\uDE2E': // :open_mouth:
      case '\uD83D\uDE22': // :cry:
      case '\uD83D\uDE20': // :angry:
      case '\uD83D\uDC4D': // :thumbsup:
      case '\uD83D\uDC4E': // :thumbsdown:
      case '':
        // valid
        break;
      case ':heart_eyes:':
      case ':love:':
        reaction = '\uD83D\uDE0D';
        break;
      case ':laughing:':
      case ':haha:':
        reaction = '\uD83D\uDE06';
        break;
      case ':open_mouth:':
      case ':wow:':
        reaction = '\uD83D\uDE2E';
        break;
      case ':cry:':
      case ':sad:':
        reaction = '\uD83D\uDE22';
        break;
      case ':angry:':
        reaction = '\uD83D\uDE20';
        break;
      case ':thumbsup:':
      case ':like:':
        reaction = '\uD83D\uDC4D';
        break;
      case ':thumbsdown:':
      case ':dislike:':
        reaction = '\uD83D\uDC4E';
        break;
      default:
        return callback({ error: 'Reaction is not a valid emoji.' });
    }

    const variables = {
      data: {
        client_mutation_id: ctx.clientMutationId += 1,
        actor_id: ctx.userID,
        action: reaction === '' ? 'REMOVE_REACTION' : 'ADD_REACTION',
        message_id: messageID,
        reaction,
      },
    };

    const qs = {
      doc_id: '1491398900900362',
      variables: JSON.stringify(variables),
      dpr: 1,
    };

    return defaultFuncs
      .postFormData('https://www.messenger.com/webgraphql/mutation/', ctx.jar, {}, qs)
      .then(utils.parseAndCheckLogin(ctx.jar, defaultFuncs))
      .then((resData) => {
        if (!resData) {
          throw new Error('setReaction returned empty object.');
        }
        if (resData.error) {
          throw resData;
        }
        callback(null);
      })
      .catch((err) => {
        log.error('setReaction', err);
        return callback(err);
      });
  };
};
