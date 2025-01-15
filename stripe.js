// functions/stripe.js
const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const endpointSecret = process.env.ENDPOINT_SECRET;
const subscriptionSuccessUrl = process.env.SUBSCRIPTION_SUCCESS_REDIRECT_URL;
const subscriptionFailUrl = process.env.SUBSCRIPTION_FAIL_REDIRECT_URL;
const companyPaymentSuccessUrl =
  process.env.COMPANY_PAYMENT_SUCCESS_REDIRECT_URL;
const companyPaymentFailUrl = process.env.COMPANY_PAYMENT_FAIL_REDIRECT_URL;
const stripeSourceId = process.env.STRIPE_SOURCE_ID;

class StripePayment {
  async checkOut(priceRuleId, customerId, userId, companyName) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceRuleId,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customerId,
      metadata: {
        company_name: companyName,
        source_id: stripeSourceId,
      },
      success_url: `${companyPaymentSuccessUrl}?user=${userId}&name=${companyName}`,
      cancel_url: companyPaymentFailUrl,
    });

    return session;
  }

  async dataSyncCheckOut(priceRuleId, customerId, companyId, sourceId) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceRuleId,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customerId,
      metadata: {
        company_id: companyId,
        source_id: sourceId,
      },
      success_url: companyPaymentSuccessUrl,
      cancel_url: companyPaymentFailUrl,
    });

    return session;
  }

  async createCustomerUsingEmail(email) {
    const customer = await stripe.customers.create({
      email,
    });
    return customer.id;
  }
  async getStripeCustomer(customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  }

  async createSubscription(stripeCustomerId) {
    const product = await stripe.products.retrieve(process.env.PRODUCT_ID);
    let subscriptionData = {};
    if (
      product?.metadata?.trial_period_days &&
      product?.metadata?.trial_period_days !== "0"
    ) {
      subscriptionData.trial_period_days = product?.metadata?.trial_period_days;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          // Please use price id here e.g price_1Q0IqLIGWig5FlZ0V4XglzUH
          price: product.default_price,
          quantity: 1,
        },
      ],

      customer: stripeCustomerId,
      mode: "subscription",
      success_url: subscriptionSuccessUrl,
      cancel_url: subscriptionFailUrl,
      subscription_data: subscriptionData,
    });

    return session;
  }

  async getSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      startTime: +`${subscription.current_period_start}000`,
      endTime: `${subscription.current_period_end}000`,
      status: subscription.status,
    };
  }
  async getSubscriptionData(subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return subscription;
  }

  async verifyWebhook(body, signature) {
    try {
      const data = await stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
      return data;
    } catch (error) {
      console.log("error verify webhook::::", error);
      throw new Error("Signature not match");
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscriptionId
      );

      return canceledSubscription;
    } catch (error) {
      console.log("error verify webhook", error);
    }
  }
  async cancelSubscriptionAtPeriodEnd(subscriptionId) {
    try {
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      return updatedSubscription;
    } catch (error) {
      console.log("error verify webhook", error);
    }
  }
  async renewSubscription(customerId, planId) {
    try {
      let stripeSubscription = await stripe.subscriptions.create({
        customer: customerId, // Replace with the customer ID
        items: [{ price: planId }], // Replace with the price ID for the new subscription
      });

      return stripeSubscription;
    } catch (error) {
      console.log("error verify webhook", error);
    }
  }
  async getStripeProduct() {
    try {
      // Retrieve the product details using the product ID from the price object
      const product = await stripe.products.retrieve(process.env.PRODUCT_ID);
      const price = await stripe.prices.retrieve(product.default_price);
      return { price, product };
    } catch (error) {
      console.log("error verify webhook", error);
    }
  }

  async updateStripeProduct(
    productId,
    productName,
    unitAmount,
    previousAmount,
    productDescription,
    trialDays
  ) {
    try {
      let usdAmount = Number(unitAmount) * 100;
      let newPrice;
      let amountChangedCheck = usdAmount === previousAmount;
      if (!amountChangedCheck) {
        newPrice = await stripe.prices.create({
          unit_amount: usdAmount, // New price in the smallest currency unit (e.g., 2000 cents = $20)
          currency: "usd",
          recurring: { interval: "year" }, // Set recurring options if applicable
          product: productId, // Replace with your actual product ID
        });
      }
      // Step 1: Create a new price for the product
      let updatedProductObj = {
        name: productName,
        description: productDescription,
        metadata: {
          trial_period_days: trialDays,
        },
      };
      if (!amountChangedCheck) {
        updatedProductObj.default_price = newPrice.id;
      }

      const updatedProduct = await stripe.products.update(
        productId, // Replace with the actual product ID
        updatedProductObj
      );

      return updatedProduct;
    } catch (error) {
      console.log("error verify webhook", error);
    }
  }
}

module.exports = StripePayment;
