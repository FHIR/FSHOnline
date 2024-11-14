import { inflateSync } from 'browserify-zlib';

// To use this function, set VITE_BITLY_KEY to a valid Bitly API key.
// Then call this function when you need the shortened link.
// Access the link or a boolean saying whether an error should be reported to the user.
// As of October 2024, that is done in ShareLink.jsx in handleOpenShare link:
// const bitlyLink = await generateLink(longLink);
// Then bitlyLink.link and bitlyLink.errorNeeded can be used as needed.
export async function generateLink(longLink) {
  return fetch('https://api-ssl.bitly.com/v4/shorten', {
    method: 'POST',
    body: JSON.stringify({ long_url: longLink }), // domain: "bit.ly" (default)
    headers: { Authorization: import.meta.env.VITE_BITLY_KEY, 'Content-Type': 'application/json' }
  })
    .then((result) => result.json())
    .then((body) => ({ link: body.link, errorNeeded: false }))
    .catch(() => {
      if (import.meta.env.VITE_BITLY_KEY == null) {
        console.error(
          'Error: VITE_BITLY_KEY needs to be set as an environment variable in order to share FSH Online links.'
        );
        return { link: undefined, errorNeeded: true };
      } else {
        return { link: undefined, errorNeeded: true };
      }
    });
}

// To use this function, set VITE_BITLY_KEY to a valid Bitly API key.
// Then call this function when you need the shared FSH text.
// As of October 2024, that is done in App.jsx in decodeFSH like:
// return expandLinkAndGetFSH(encodedFSH);
export async function expandLinkAndGetFSH(encodedFsh) {
  const bitlyURL = `bit.ly/${encodedFsh}`;
  const bitlyResults = await fetch('https://api-ssl.bitly.com/v4/expand', {
    method: 'POST',
    body: JSON.stringify({ bitlink_id: bitlyURL }),
    headers: { Authorization: import.meta.env.VITE_BITLY_KEY, 'Content-Type': 'application/json' }
  })
    .then((result) => result.json())
    .catch((error) => console.error(error));
  const encodedData = await bitlyResults.long_url?.match(
    /^https?:\/\/(fshonline\.fshschool\.org|fshschool\.org\/FSHOnline)\/#\/share\/(.*)/
  )?.[2];
  if (!encodedData || encodedData === '') {
    return '';
  } else {
    return inflateSync(Buffer.from(encodedData, 'base64')).toString('utf-8');
  }
}
