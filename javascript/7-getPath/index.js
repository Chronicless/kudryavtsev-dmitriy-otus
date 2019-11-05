function getPath(nodeElem) {
  let query = '';
  let path = [];

  const converToQuery = currNodeElement =>
    // eslint-disable-next-line max-len,implicit-arrow-linebreak
    `${currNodeElement.nodeName.toLowerCase()}:nth-child(${Array.from(currNodeElement.parentNode.children).indexOf(currNodeElement) + 1})`;
  const buildTreeForSelector = (childNode) => {
    if (childNode.id) {
      return `#${childNode.id}`;
    }
    if (!childNode.parentElement) {
      return childNode.nodeName.toLowerCase();
    }
    path.push(converToQuery(childNode));
    return buildTreeForSelector(childNode.parentElement);
  };

  query = buildTreeForSelector(nodeElem);

  // we have to start from the root , not from the tree of array
  // so reversing array

  path = path.reverse();
  path.forEach((elem) => {
    query += ` > ${elem}`;
  });
  return query;
}
