export function sliceDependency(dependencies) {
  const dependenciesArray = dependencies.split(',');
  return dependenciesArray
    .map((dependency) => {
      const trimmedDep = dependency.trim();
      if (trimmedDep === '') {
        return trimmedDep;
      }
      const [packageId, version] = trimmedDep.split('#');
      return { packageId, version };
    })
    .filter((d) => d); // filter out any empty strings
}
