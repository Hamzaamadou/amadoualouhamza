const axios = require("axios");

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_BASE_URL = "https://api-checkout.cinetpay.com/v2";

module.exports = {
  async pay({ amount, currency = "XOF", transactionId, customer }) {
    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount,
      currency,
      description: "Paiement AHA TopUp",
      customer_name: customer.name,
      customer_phone_number: customer.phone,
      notify_url: `${process.env.BASE_URL}/webhook/cinetpay`,
      return_url: `${process.env.FRONTEND_URL}/payment-success`
    };

    const { data } = await axios.post(
      `${CINETPAY_BASE_URL}/payment`,
      payload
    );

    if (data.code !== "201") {
      throw new Error("CinetPay error");
    }

    return {
      provider: "cinetpay",
      status: "pending",
      paymentUrl: data.data.payment_url,
      reference: transactionId
    };
  }
};