const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient(process.env.REACT_APP_BITLY_KEY);

export async function generateLink(longLink) {
  return new Promise((resolve, reject) => {
    bitly
      .shorten(longLink)
      .then(function (result) {
        resolve(result.link);
      })
      .catch(function (error) {
        if (process.env.REACT_APP_BITLY_KEY == null) {
          console.error(
            'Error: REACT_APP_BITLY_KEY needs to be set as an environment variable in order to share FSH Online links.'
          );
        } else {
          console.error('Error accessing link shortening service');
        }
      });
  });
}
