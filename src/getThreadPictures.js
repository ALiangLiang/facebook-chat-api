const utils = require('../utils');
const log = require('npmlog');

module.exports = function wrapper(defaultFuncs, api, ctx) {
  return function getThreadPictures(threadID, offset, limit, callback) {
    if (!callback) {
      throw new Error('getThreadPictures: need callback');
    }

    let form = {
      thread_id: threadID,
      offset,
      limit,
    };

    defaultFuncs
      .post('https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) {
          throw resData;
        }
        return Promise.all(resData.payload.imagesData.map((image) => {
          form = {
            thread_id: threadID,
            image_id: image.fbid,
          };
          return defaultFuncs
            .post('https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php', ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then((resData2) => {
              if (resData2.error) {
                throw resData2;
              }
              // the response is pretty messy
              const queryThreadID = resData2.jsmods.require[0][3][1]
                .query_metadata.query_path[0].message_thread;
              const imageData = resData2.jsmods.require[0][3][1]
                .query_results[queryThreadID].message_images.edges[0].node.image2;
              return imageData;
            });
        }));
      })
      .then((resData) => {
        callback(null, resData);
      })
      .catch((err) => {
        log.error('Error in getThreadPictures', err);
        callback(err);
      });
  };
};
