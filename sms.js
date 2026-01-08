// backend/services/sms.js
module.exports.sendSms = async (phone, message) => {
  console.log("SMS envoyé à", phone, ":", message);
  return true;
};