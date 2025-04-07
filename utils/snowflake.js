const { Snowflake } = require('nodejs-snowflake');

module.exports = new Snowflake({
  custom_epoch: new Date('2024-08-14T00:00:00Z').getTime(),
  instance_id: 0,
});