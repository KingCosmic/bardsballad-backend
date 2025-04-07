const { Snowflake } = require('nodejs-snowflake');
const sfUtil = require('./snowflake');
const convertToDays = require('./time/convertToDays');

// this function only checks if the api key is valid, and not expired.
// Not if it is associated with a user or device.
function verifyApiKey(apiKey) {
  if (!apiKey) return false;

  const [prefix, crypto, snowflake] = apiKey.split('-');

  if (!prefix || !crypto ||!snowflake) return false;

  if (prefix !== process.env.API_KEY_PREFIX) {
    return false;
  }

  if (crypto.length !== 10) return false;

  const sfID = BigInt(snowflake);

  const timestamp = Snowflake.timestampFromID(sfID, sfUtil.customEpoch());

  const now = Date.now();

  if (now - timestamp > convertToDays(process.env.API_KEY_EXPIRES_IN)) return false;

  return true;
}

module.exports = verifyApiKey;