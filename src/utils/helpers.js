export function sliceDependency(dependencies) {
  let returnArr = [];
  const arr = dependencies.split(',');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].trim();
    if (arr[i] === '') {
      continue;
    }
    let singleDep = arr[i].split('#');
    returnArr.push([singleDep[0], singleDep[1]]);
  }
  return returnArr;
}
