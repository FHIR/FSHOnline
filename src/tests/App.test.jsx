import { waitFor } from '@testing-library/react';
import { decodeFSH } from '../App';
import * as bitlyWorker from '../utils/BitlyWorker';

test('decodeFSH will return a properly decoded string from base64', async () => {
  const expandLinkSpy = vi.spyOn(bitlyWorker, 'expandLink').mockReset().mockResolvedValue({
    long_url: 'https://fshschool.org/FSHOnline/#/share/eJzzyNRRKMnILFYAokSFktTiEoW0/CKFlNTk/JTMvHQ9ALALCwU='
  });
  const base64 = {
    text: '2Lpe5ZL'
  };
  const decoded = await decodeFSH(base64);
  const expectedDecoded = 'Hi, this is a test for decoding.';
  await waitFor(() => {
    expect(decoded).toEqual(expectedDecoded);
    expect(expandLinkSpy).toHaveBeenCalled();
  });
});
