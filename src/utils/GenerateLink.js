import { utils } from 'fsh-sushi';
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient('2740ea05eb8099e664f60559416380f4f06d9dc8');
const logger = utils.logger;

export async function generateLink(longLink) {
  return new Promise((resolve, reject) => {
    bitly
      .shorten(longLink)
      .then(function (result) {
        resolve(result.link);
      })
      .catch(function (error) {
        logger.error('accessing link shortening service');
        reject();
      });
  });
}
