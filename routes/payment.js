require('dotenv').config();
const express = require('express');
const router = express.Router();


router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,        // Amount in smallest unit (e.g., paise or cents)
      currency,      // 'inr' or 'usd'
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).send({ error: err.message });
  }
});




module.exports = router;
