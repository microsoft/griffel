/**
 * Custom Webpack loader that removes "export const meta = {}" from code.
 *
 * @param {String} sourceCode
 * @return {String}
 */
module.exports = function webpackLoader(sourceCode) {
  return sourceCode.replace(/export const meta = {(.|\n)+};/, '').trim();
};
