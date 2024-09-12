As of 2024 Sept 4:

The `npm outdated` command reports some dependencies as outdated. They are not being updated at this time for the reasons given below:

- `react` / `react-dom`: React is currently tracking the latest v17 versions, as updating to 18 requires significant investment.
- `@testing-library/react`: The React Testing Library is currently tracking the latest v12 versions because v13 requires React 18.
- `react-codemirror2`: React CodeMirror is tracking the latest v7 version, as updating to major version v8 requires React 18.
- `codemirror`: CodeMirror is tracking the latest v5 version, as updating to major version v6 requires refactoring.
- `eslint`: ESLint v9 was released recently. However, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-flowtype` all still require ESLint v8. There are issues open on each to support v9.
