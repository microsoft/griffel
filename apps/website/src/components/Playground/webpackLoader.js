/**
 * @param {String} sourceCode
 * @return {String}
 */
module.exports = function webpackLoader(sourceCode) {
  return sourceCode.replace(/export const meta = {(.|\n)+};/, '').trim();
};
