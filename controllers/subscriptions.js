const { Subscription, Session, User } = require("../models");
const StripePayment = require("../stripe");

const stripePayment = new StripePayment();

const createSubscriptionSession = async (req, res) => {
  const { plan, price, userId } = req.body;

  if (!plan || !price) {
    return res.status(400).json({ message: "Plan and price are required" });
  }

  try {
    const priceRuleId = process.env.SUBSCRIPTION_PRICE || "";
    const { stripeCustomerId } = await User.findByUserId(userId);
    const createSubscriptionSession = await stripePayment.createSubscription(
      stripeCustomerId
    );
    await Session.create({
      userId,
      priceRuleId,
      sessionId: createSubscriptionSession.id,
      customerId: stripeCustomerId,
      plan,
      price,
      subscription: true,
    });
    res.status(201).json({
      message: "Subscription sesssion added successfully",
      subscriptionSession: createSubscriptionSession.url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating subscription", error: error.message });
  }
};

const getSubscriptions = async (req, res) => {
  const { userId } = req;

  try {
    const subscriptions = await Subscription.findByUserId(userId);
    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving subscriptions",
      error: error.message,
    });
  }
};
const getStripeSubscription = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscription.findByUserId(userId);

    const subscription = await stripePayment.getSubscriptionData(
      subscriptions[0].subscriptionId
    );

    return res.json({ subscription });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving subscriptions",
      error: error.message,
    });
  }
};

const cancelSubscriptions = async (req, res) => {
  const { userId } = req.params;
  const { type } = req.body;

  try {
    const subscription = await Subscription.findByUserId(userId);
    if (type === "cancelled") {
      const cancelSubscription =
        await stripePayment.cancelSubscriptionAtPeriodEnd(
          subscription[0].subscriptionId
        );

      res.status(200).json({
        message: "Subscription canceled successfully",
        data: cancelSubscription,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving subscriptions",
      error: error.message,
    });
  }
};
const getStripeProduct = async (req, res) => {
  try {
    const product = await stripePayment.getStripeProduct();
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
    });
  }
};
const updateStripeProduct = async (req, res) => {
  const { productName, productPrice, productDescription, trialDays } = req.body;

  try {
    const product = await stripePayment.getStripeProduct();

    // Step 1: Update the product name
    const productUpdated = await stripePayment.updateStripeProduct(
      product.product.id,
      productName,
      productPrice,
      product.price.unit_amount,
      productDescription,
      trialDays
    );

    return res.status(200).json(productUpdated);
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
    });
  }
};

module.exports = {
  createSubscriptionSession,
  getSubscriptions,
  cancelSubscriptions,
  getStripeProduct,
  updateStripeProduct,
  getStripeSubscription,
};
