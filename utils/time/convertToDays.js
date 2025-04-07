const convertToHours = require('./convertToHours');
/**
 * Converts a number to days in milliseconds
 * @param {number} days - The number of days to convert
 * @returns {number} The days converted to milliseconds
 */
const convertToDays = (days) => {
  return convertToHours(days * 24)
}

module.exports = convertToDays;