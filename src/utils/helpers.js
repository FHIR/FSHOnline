export function sliceDependency(dependencies) {
  const dependenciesArray = dependencies.split(',');
  return dependenciesArray
    .map((dependency) => {
      const trimmedDep = dependency.trim();
      if (trimmedDep === '') {
        return trimmedDep;
      }
      const [packageId, version] = trimmedDep.split('#');
      if (version == null) {
        // Don't include the dependency if a version wasn't provided (or there was a typo and no # was provided)
        return;
      }
      return { packageId, version };
    })
    .filter((d) => d); // filter out any empty strings
}
