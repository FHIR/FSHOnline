import { decodeFSH } from '../App';

beforeAll(() => {
  document.body.createTextRange = () => {
    return {
      getBoundingClientRect: () => ({ right: 0 }),
      getClientRects: () => ({ left: 0 })
    };
  };
});

test('decodeFSH will return a properly decoded string from base64', () => {
  const base64 = {
    text:
      'UHJvZmlsZTogICAgICAgIEZpc2hQYXRpZW50ClBhcmVudDogICAgICAgICBQYXRpZW50CklkOiAgICAgICAgICAgICBmaXNoLXBhdGllbnQKVGl0bGU6ICAgICAgICAgICJGaXNoIFBhdGllbnQiCkRlc2NyaXB0aW9uOiAgICAiQSBwYXRpZW50IHRoYXQgaXMgYSB0eXBlIG9mIGZpc2guIg'
  };
  const decoded = decodeFSH(base64);
  const expectedDecoded = [
    'Profile:        FishPatient',
    'Parent:         Patient',
    'Id:             fish-patient',
    'Title:          "Fish Patient"',
    'Description:    "A patient that is a type of fish."'
  ].join('\n');
  expect(decoded).toEqual(expectedDecoded);
});
