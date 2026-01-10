const axios = require("axios");

module.exports = {
  async pay({ amount, currency = "XOF", transactionId, customer }) {
    const payload = {
      tx_ref: transactionId,
      amount,
      currency,
      redirect_url: `${process.env.FRONTEND_URL}/payment-success`,
      customer: {
        email: customer.email || "client@ahatopup.com",
        phonenumber: customer.phone,
        name: customer.name
      },
      customizations: {
        title: "AHA TopUp",
        description: "Paiement Mobile Money"
      }
    };

    const { data } = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    if (data.status !== "success") {
      throw new Error("Flutterwave error");
    }

    return {
      provider: "flutterwave",
      status: "pending",
      paymentUrl: data.data.link,
      reference: transactionId
    };
  }
};