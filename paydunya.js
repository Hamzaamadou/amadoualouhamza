const axios = require("axios");

const PAYDUNYA_BASE_URL = "https://app.paydunya.com/api/v1/checkout-invoice/create";

module.exports = {
  async pay({ amount, transactionId, customer }) {
    const payload = {
      invoice: {
        total_amount: amount,
        description: "Paiement AHA TopUp"
      },
      store: {
        name: "AHA TopUp"
      },
      custom_data: {
        transaction_id: transactionId,
        customer_phone: customer.phone
      }
    };

    const headers = {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
      "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
      "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN
    };

    const { data } = await axios.post(PAYDUNYA_BASE_URL, payload, { headers });

    if (!data.response_code || data.response_code !== "00") {
      throw new Error("PayDunya error");
    }

    return {
      provider: "paydunya",
      status: "pending",
      paymentUrl: data.response_text,
      reference: transactionId
    };
  }
};