const Log = require("../models/Log");

module.exports.log = async (userId, action, details = {}) => {
  const log = new Log({ userId, action, details });
  await log.save();
  console.log(`📝 Action enregistrée: ${action} pour ${userId}`);
};
