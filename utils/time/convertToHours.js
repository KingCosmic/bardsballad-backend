
/**
 * Converts a number to hours in milliseconds
 * @param {number} hours - The number of hours to convert
 * @returns {number} The hours converted to milliseconds
 */
const convertToHours = (hours) => {
  return hours * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
}

module.exports = convertToHours;