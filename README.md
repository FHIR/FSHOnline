# FSH Online

FSH Online is a web application for authoring [FHIR Shorthand (FSH)](https://build.fhir.org/ig/HL7/fhir-shorthand/) and running the [SUSHI](https://github.com/FHIR/sushi) compiler on the authored FSH directly in a web browser. It is available on https://fshschool.org/FSHOnline/.

NOTE: This application is an early alpha release and is designed to be used for initial exploration.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting Started

To run the project locally, [Node.js](https://nodejs.org/) must be installed on the user's system.

In order to install all the required dependencies for the project, clone the repository and run the following command:

```bash
npm install
```

Once the dependencies are installed, the application can be run in development mode by running the following command:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits. Lint errors will appear in the console.

## Adding new FSH examples

FSH Online supports easily adding FHIR Shorthand examples that can be viewed in the editor. All examples are specified with an entry in the configuration file and an accompanying `.fsh` file with the example FHIR Shorthand.
In order to add new examples, follow these steps:

- Add a `.fsh` file to `src/examples/`
- If you would like your example to be part of a new group, add a top level entry to the `examples-config.json` object. The key should be the name of your new group that will be displayed in the application.
- For each example that you would like under a particular group, add an entry to the `files` array of the group
- A file entry contains the following properties:
  - `name`: (Required) This is the name that will be displayed in the Examples menu in the application
  - `link`: (Required) This is the relative path that will appear in the URL when this example is selected.
    - **Note:** The end of this path _must_ match the name of your example file, without the `.fsh` file extension

Below is an example of what the configuration in `src/examples/examples-config.json` should look like for an example called `SimpleProfile` that has a corresponding file `src/examples/SimpleProfile.fsh`

```json
{
  "Introduction": {
    "files": [
      {
        "name": "A Simple Profile",
        "link": "/examples/SimpleProfile"
      }
    ]
  }
}
```

## NPM Tasks

The following NPM tasks are useful in development.

### Tests

To run the project's tests, run the following command:

```bash
npm test
```

This will launch the test runner in the interactive watch mode. For more information, see the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) in the Create React App documentation.

### Lint

To run the linter for the project, run the following command:

```bash
npm run lint
```

Any issues will be listed. Some issues can be automatically fixed by lint. In order to fix these issues, run the following command:

```bash
npm run lint-fix
```

### Prettier

To run the prettier code formatting, run the following command:

```bash
npm run prettier
```

### Build

To build the app for production, run the following command:

```bash
npm run build
```

This will bundle the project in production mode and optimize the build for the best performance. The build will be output to the `build` folder. The build is minified and the filenames include the hashes.

The build can be used to deploy the application. For more information, see the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) in the Create React App documentation.

### Eject

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

To eject this project, run:

```bash
npm run eject
```

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

### FHIR Shorthand

To learn more about FHIR Shorthand (FSH), check out the [specification](https://build.fhir.org/ig/HL7/fhir-shorthand/). To learn more about SUSHI, check out the [documentation](https://fshschool.org/docs/sushi/). For other resources and tools to use with FHIR Shorthand, check out [FSH School](https://fshschool.org/).

### React

To learn React, check out the [React documentation](https://reactjs.org/).
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) as well.

# License

Copyright 2019 Health Level Seven International

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
