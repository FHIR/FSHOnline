const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient(process.env.REACT_APP_BITLY_KEY);

export async function generateLink(longLink) {
  return new Promise((resolve) => {
    bitly
      .shorten(longLink)
      .then(function (result) {
        resolve({ link: result.link, errorNeeded: false });
      })
      .catch(function (error) {
        if (process.env.REACT_APP_BITLY_KEY == null) {
          console.error(
            'Error: REACT_APP_BITLY_KEY needs to be set as an environment variable in order to share FSH Online links.'
          );
          resolve({ link: undefined, errorNeeded: true });
        } else {
          resolve({ link: undefined, errorNeeded: true });
        }
      });
  });
}

export async function expandLink(encodedFsh) {
  const bitlyURL = `https://bit.ly/${encodedFsh.text}`;
  return new Promise((resolve) => {
    bitly
      .expand(bitlyURL)
      .then(function (result) {
        resolve(result);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
