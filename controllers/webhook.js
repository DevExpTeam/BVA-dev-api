const {
  Session,
  Payment,
  Subscription,
  AllCompany,
  AccountingData,
  User,
  DataSync,
} = require("../models");
const { db } = require("../firebase");

const StripePayment = require("../stripe");

const stripeWeebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let body;
  try {
    const stripePayment = new StripePayment();
    body = await stripePayment.verifyWebhook(req.rawBody, signature);
  } catch (err) {
    return res.status(400).send(`Webhook Error ${err.message}`);
  }
  let event = body.type;

  try {
    const session = body.data.object;
    const metadata = session.metadata;
    if (event === "checkout.session.completed" && session.mode === "payment") {
      const sessionId = session.id;

      const oldSession = await Session.findBySessionRefId(sessionId);

      if (oldSession) {
        const companyId = oldSession?.companyId;
        const reason = oldSession?.reason;
        const transaction = {
          userId: oldSession.userId,
          priceRuleId: oldSession.priceRuleId,
          transactioId: body.id,
        };

        if (reason === "CREATE_COMPANY") {
          const company = {
            companyName: metadata.company_name,
            status: "PENDING",
            userId: oldSession.userId,
          };
          const companydata = await Payment.create(transaction);
          const companyResult = await AllCompany.create(company);
          const accounting = await AccountingData.create({ companyId: companyResult.id });

          const updatesession = await Session.updateBySessionRefId(sessionId, {
            completed: true,
          });
          
          return res.status(200).json({ message: "success" });
        } else if (reason === "SYNC_COMPANY") {
          const updateData = {
            status: "PENDING",
          };
console.log("comId", companyId)
          const companydata = await Payment.create(transaction);
          const editCompany = await AllCompany.updateByCompanyRefId(
            companyId,
            updateData
          );

          const updatesession = await Session.updateBySessionRefId(sessionId, {
            completed: true,
          });
          return res.status(200).json({ message: "success" });
        }
      }
      return res.status(200).json({ message: "success" });
    }

    if (
      (event === "checkout.session.completed" &&
        session.mode === "subscription") ||
      event === "invoice.payment_succeeded"
    ) {
      const sessionId = session.id;
      const oldSession = await Session.findBySessionRefId(sessionId);

      if (oldSession) {
        const subscriptionId = session.subscription;
        const stripePayment = new StripePayment();
        const { startTime, endTime } = await stripePayment.getSubscription(
          subscriptionId
        );
        console.log({ startTime, endTime });
        const transaction = {
          userId: oldSession.userId,
          priceRuleId: oldSession.priceRuleId,
          transactioId: body.id,
        };
        const subscription = {
          userId: oldSession.userId,
          subscribeAt: startTime,
          subscribeEnd: endTime,
          subscriptionId,
          plan: oldSession.plan,
          price: oldSession.price,
          currency: "usd",
          isRenew: true,
          isCanceled: false,
        };
        await Subscription.create(subscription);
        await Session.updateBySessionRefId(sessionId, { completed: true });
        await User.activeUserById(oldSession.userId);
        await Payment.create(transaction);
        return res.status(200).json({ message: "success-subscription" });
      }
      return res.status(200).json({ message: "success" });
    }
    if (event === "customer.subscription.updated") {
      const subscriptionId = session.id;

      const updateData = {
        subscribeAt: session.current_period_start,
        subscribeEnd: session.current_period_end,
      };
      if (subscriptionId) {
        await Subscription.updateBySubscriptionId(subscriptionId, updateData);
      }
      return res
        .status(200)
        .json({ message: "Subscription updated successfully" });
    }

    if (event === "customer.subscription.deleted") {
      const subscriptionId = session.id;
      const updateData = {
        isRenew: false,
      };
      await Subscription.updateBySubscriptionId(subscriptionId, updateData);

      const stripePayment = new StripePayment();
      const customer = await stripePayment.getStripeCustomer(session.customer);

      const oldSession = await User.findByUserEmail(customer.email);

      await User.inActiveUserById(oldSession[0].id);

      // changes
      const updateSubsData = {
        isCanceled: true,
        isRenew: false,
      };
      await Subscription.updateBySubscriptionId(subscriptionId, updateSubsData);

      return res
        .status(200)
        .json({ message: "Subscription deleted successfully" });
    }
    if (event === "invoice.payment_failed") {
      const sessionId = session.id;
      const oldSession = await Session.findBySessionRefId(sessionId);
      await User.inActiveUserById(oldSession.userId);
    }

    return res.status(200).json({
      message: "Webhook Get Successfully",
      event,
      sessionMode: session.mode,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error retrieving payments", error: error.message });
  }
};

module.exports = { stripeWeebhook };
