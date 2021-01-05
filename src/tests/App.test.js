// import React from 'react';
// import { render } from '@testing-library/react';
import { decodeFSH } from '../App';
// import { AppRouter } from '../index';
// import { MemoryRouter } from 'react-router-dom';

beforeAll(() => {
  document.body.createTextRange = () => {
    return {
      getBoundingClientRect: () => ({ right: 0 }),
      getClientRects: () => ({ left: 0 })
    };
  };
});

//This test needs some work
// test.skip('Renders FSH Online App', () => {
//   const { getByText } = render(
//     <MemoryRouter initialEntries={['/FSHOnline']}>
//       <AppRouter />
//     </MemoryRouter>
//   );
//   const linkElement = getByText(/FSH Online/i);
//   expect(linkElement).toBeInTheDocument();
// });

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
