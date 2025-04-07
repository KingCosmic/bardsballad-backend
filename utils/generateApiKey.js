const crypto = require('crypto');
const snowflake = require('./snowflake');

module.exports = () => {
  const randomBytes = crypto.randomBytes(5).toString('hex');
  const snowflakeId = snowflake.getUniqueID();
  return `${process.env.API_KEY_PREFIX}-${randomBytes}-${snowflakeId}`
}