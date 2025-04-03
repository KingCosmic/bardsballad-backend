/**
 * Returns the last element of an array
 * @param {Array} array - The array to get the last element from
 * @returns {*} The last element of the array
 */
module.exports = (array) => {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[array.length - 1];
}
