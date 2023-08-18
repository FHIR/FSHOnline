// Based on documentation here: https://jestjs.io/docs/configuration#resolver-string
// FSH Online needs a resolver because the anltr4 package tries to manipulate which dist file
// to use in node vs browser environments in the package.json#exports property.
// However, Jest ignores the exports property. So we need a resolver to resolve it correctly.
// Also see https://github.com/jestjs/jest/issues/10422
module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: (pkg) => {
      return {
        ...pkg,
        // Alter the value of `main` before resolving the antlr4 package
        main: pkg.name === 'antlr4' ? 'dist/antlr4.node.cjs' : pkg.main
      };
    }
  });
};
