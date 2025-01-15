const { Payment, Session, User } = require("../models");
const StripePayment = require("../stripe");

const createPaymentSession = async (req, res) => {
  const { userId } = req;
  const { amount, currency, description, source } = req.body;
  if (!amount) {
    return res.status(400).json({
      message: "Amount, currency, description, and source are required",
    });
  }

  try {
    const { stripeCustomerId } = await User.findByUserId(userId);
    const stripePayment = new StripePayment(); // Instantiate the class
    const createSession = await stripePayment.checkOut(
      amount,
      stripeCustomerId,
      companyName,
      address
    );
    const payment = await Session.create({
      userId,
      amount,
      currency: "usd",
      subscription: false,
      customerId: createSession.customer,
      sessionId: createSession.id,
    });
    res.status(201).json({
      message: "payment session successfully",
      session: createSession,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating payment", error: error.message });
  }
};

const getPayments = async (req, res) => {
  const { userId } = req;

  try {
    const payments = await Payment.findByUserId(userId);
    res.json({ payments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving payments", error: error.message });
  }
};

module.exports = { createPaymentSession, getPayments };
