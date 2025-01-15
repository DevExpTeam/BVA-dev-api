const { auth, db } = require("../firebase");
const { User } = require("../models");
const StripePayment = require("../stripe");

const stripePayment = new StripePayment();

const signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await auth.createUser({ email, password });

    // Create a new customer in Stripe
    const stripeCustomerId = await stripePayment.createCustomerUsingEmail(
      email
    );
    const timestamp = new Date().getTime();

    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      stripeCustomerId: stripeCustomerId,
      role: "user",
      email: email,
      isActive: true,   //temporary disable first-time payment
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    res.status(201).send({ uid: userRecord.uid });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
};

const checkUserSubscription = async (req, res) => {
  const { email } = req.body;
  try {
    const userData = await User.findByUserEmail(email);

    res.status(200).send(userData);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const verifyToken = async (req, res) => {
  const { idToken } = req.body;
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    res.status(200).send(decodedToken);
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};
const generateAdmin = async (req, res) => {
  const { uid, role } = req.body;
  try {
    if (uid && role) {
      await auth.setCustomUserClaims(uid, { role });
      await db.collection("users").doc(uid).update({
        role: "admin",
      });
      console.log(`Custom claims set for user ${uid}: Admin Generated`);
      res.status(200).send("Admin generated");
    } else {
      res.status(400).send("Data missing in request body.");
    }
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

module.exports = { signUp, checkUserSubscription, verifyToken, generateAdmin };
