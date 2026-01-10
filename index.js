const cinetpay = require("./cinetpay");
const paydunya = require("./paydunya");
const flutterwave = require("./flutterwave");

module.exports = async function pay(provider, payload) {
  switch (provider) {
    case "cinetpay":
      return cinetpay.pay(payload);

    case "paydunya":
      return paydunya.pay(payload);

    case "flutterwave":
      return flutterwave.pay(payload);

    default:
      throw new Error("Provider de paiement non supporté");
  }
};