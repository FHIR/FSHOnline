export async function setExampleText(example) {
  const module = await import(`../examples/${example}.txt`);
  return fetch(module.default)
    .then((response) => response.text())
    .then((data) => {
      return data;
    });
}
