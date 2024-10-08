# FSH Online

FSH Online is a web application for authoring [FHIR Shorthand (FSH)](https://build.fhir.org/ig/HL7/fhir-shorthand/) and running the [SUSHI](https://github.com/FHIR/sushi) compiler on the authored FSH directly in a web browser. It also runs the [GoFSH](https://github.com/FHIR/GoFSH) decompiler to translate FHIR definitions into FSH. It is available on https://fshonline.fshschool.org/.

## FHIR Foundation Project Statement

- Maintainers: This project is maintained by the HL7 community.
- Issues / Discussion: For FSH Online issues, such as bug reports, comments, suggestions, questions, and feature requests, visit [FSH Online GitHub Issues](https://github.com/FHIR/FSHOnline/issues). For discussion of FHIR Shorthand and its associated projects, visit the FHIR Community Chat @ https://chat.fhir.org. The [#shorthand stream](https://chat.fhir.org/#narrow/stream/215610-shorthand) is used for all FHIR Shorthand questions and discussion.
- License: All contributions to this project will be released under the Apache 2.0 License, and a copy of this license can be found in [LICENSE](LICENSE).
- Contribution Policy: The FSH Online Contribution Policy can be found in [CONTRIBUTING.md](CONTRIBUTING.md).
- Security Information: The FSH Online Security Information can be found in [SECURITY.md](SECURITY.md).
- Compliance Information: FSH Online uses SUSHI and GoFSH, which are designed for use with FHIR artifacts conforming to FHIR R4, FHIR R4B, or FHIR R5. For more details, see the README files for SUSHI and GoFSH.

## Intro to FSH Online Development

To learn more about FSH Online, watch the Knowledge Sharing Sessions for [Developing FSH Tools](https://vimeo.com/990594228/056b5c075f) (view the slides [here](https://confluence.hl7.org/display/FHIR/FSH+Knowledge+Sharing+Sessions?preview=/256509612/256514908/KSS%203%20-%20Developing%20FSH%20Tools.pdf)) and [Developing FSH Online](https://vimeo.com/1001309534/d2ece04c26) (view the slides [here](https://confluence.hl7.org/display/FHIR/FSH+Knowledge+Sharing+Sessions?preview=/256509612/265488031/KSS%206%20-%20Developing%20FSH%20Online.pdf)).
These sessions provide a technical overview of the codebase, summarize key concepts for developers, and demonstrate how to add new FSH examples.

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

Open [http://localhost:5173/](http://localhost:5173/) to view it in the browser. The page will reload if you make edits. Lint and prettier errors will appear in the console.

## FSH Examples

FSH Online supports easily adding FHIR Shorthand examples that can be viewed in the editor. All examples are kept in the [FSHOnline-Examples repo](https://github.com/FHIR/FSHOnline-Examples), and FSH authors are encouraged to submit example FSH files to the FSHOnline-Examples repo.

## NPM Tasks

The following NPM tasks are useful in development.

### Tests

To run the project's tests, run the following command:

```bash
npm test
```

This will launch the test runner in the interactive watch mode. For more information, see the [Vitest](https://vitest.dev/) documentation.

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

This will bundle the project in production mode and optimize the build for the best performance. The build will be output to the `dist` folder. This build is minified and can be used to deploy the application. For more information, see Vite's [Building for Production](https://vitejs.dev/guide/build.html#building-for-production) documentation and the [build CLI options](https://vitejs.dev/guide/cli.html#build.)

### Serve Build

To serve the built application locally for testing, run the following command:

```bash
npm run preview
```

This will serve the built application from the `dist` directory. It will be served on port 4173. You can access it at the following URL: [http://localhost:4173/](http://localhost:4173/).

## Learn More

### FHIR Shorthand

To learn more about FHIR Shorthand (FSH), check out the [specification](https://build.fhir.org/ig/HL7/fhir-shorthand/). To learn more about SUSHI, check out the [documentation](https://fshschool.org/docs/sushi/) and to learn more about GoFSH, visit the [documentation](https://fshschool.org/docs/gofsh/). For other resources and tools to use with FHIR Shorthand, check out [FSH School](https://fshschool.org/).

### React

To learn React, check out the [React documentation](https://react.dev/).

# License

Copyright 2019-2024 Health Level Seven International

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
