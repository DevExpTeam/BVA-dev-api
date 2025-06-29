const express = require("express");
const admin = require("../controllers/admin");
const auth = require("../controllers/auth");
const openai = require("../controllers/openai");
const sources = require("../controllers/sources");
const company = require("../controllers/company");
const payments = require("../controllers/payments");
const subscriptions = require("../controllers/subscriptions");
const version = require("../controllers/version");
const dataSync = require("../controllers/dataSync");
const webhook = require("../controllers/webhook");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/signup", auth.signUp);
router.post("/check-subscription", auth.checkUserSubscription);
router.post("/verify-token", auth.verifyToken);
router.post("/generate-admin", auth.generateAdmin);

// Admin routes
router.get("/admin/settings", admin.getSettings);
router.post("/admin/settings", admin.updateSettings);

//openAI
router.post("/openai/category", openai.getCategory);
router.post("/openai/note", openai.getNote);
router.post("/openai/searchRate", openai.getSearchRate);
router.post("/openai/searchCompany", openai.getSearchCompany);
router.post("/openai/searchReport", openai.getSearchReport);

// Source routes
router.post("/sources", verifyToken, sources.addSource);
router.get("/sources", verifyToken, sources.getSources);
router.put("/sources/:id", verifyToken, sources.editsSources);

// Company routes
router.post("/company", verifyToken, company.addSyncCompany);
router.get("/company", verifyToken, company.getCompany);
router.put("/company", company.editCompany);      //from data poviders
router.post("/company-data", verifyToken, company.getData);
router.post("/company-link", company.verifyLink);     //from global
router.put("/company-codat/:id", verifyToken, company.editCompanyByIdForCodat);

// Subscription routes
router.post("/subscriptions-session", subscriptions.createSubscriptionSession);
router.get("/subscriptions", verifyToken, subscriptions.getSubscriptions);
router.get(
  "/stripe-subscription/:userId",
  verifyToken,
  subscriptions.getStripeSubscription
);
router.post(
  "/cancel-subscriptions/:userId",
  verifyToken,
  subscriptions.cancelSubscriptions
);
router.get("/get-stripe-product", subscriptions.getStripeProduct);
router.patch(
  "/update-stripe-product",
  verifyToken,
  subscriptions.updateStripeProduct
);

// Payment routes
router.post("/payments-session", verifyToken, payments.createPaymentSession);
router.get("/payments", verifyToken, payments.getPayments);

// Data Sync routes
router.post("/sync", verifyToken, dataSync.syncData);
router.get("/get-datasync/:id", verifyToken, dataSync.getDataSync);
router.put("/datasync/:id", verifyToken, dataSync.editByDataSyncId);

// Backend  details
router.get("/get-api-version", verifyToken, version.getVersion);

module.exports = router;
