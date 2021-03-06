// A small transformPlugin to test configuration options
// Replaces all "red" strings with "blue" ones

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: 'color-rename-transformPlugin',
    visitor: {
      StringLiteral(path) {
        if (path.node.value === 'red') {
          path.replaceWith(t.StringLiteral('blue'));
        }
      },
    },
  };
};
