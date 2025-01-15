const { User, Session, Company, DataSync } = require("../models");
const StripePayment = require("../stripe");

// Sync Data for a Company
const syncData = async (req, res) => {
  const { companyId } = req.body;

  try {
    const { sourceId } = await Company.findById(companyId);
    const {
      SOURCE1_ID: source1Id,
      SOURCE2_ID: source2Id,
      FIRST_SOURCE_COMPANY: source1PriceRuleId,
      SECOND_SOURCE_COMPANY: source2PriceRuleId,
    } = process.env;

    const priceRuleMap = {
      [source1Id]: source1PriceRuleId,
      [source2Id]: source2PriceRuleId,
    };

    const priceRuleId = priceRuleMap[sourceId] || "";

    const userId = req.userId;
    const { stripeCustomerId } = await User.findByUserId(userId);
    const stripePayment = new StripePayment(); // Instantiate the class
    const createSession = await stripePayment.dataSyncCheckOut(
      priceRuleId,
      stripeCustomerId,
      companyId,
      sourceId
    );
    const payment = await Session.create({
      userId,
      priceRuleId,
      currency: "usd",
      subscription: false,
      customerId: createSession.customer,
      sessionId: createSession.id,
      reason: "COMPANY_DATASYNC",
    });
    res.status(200).json({
      message: "Datasync checkout session successfully",
      sessionUrl: createSession.url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while syncData", error: error.message });
  }
};

// Get Data Sync By companyId
const getDataSync = async (req, res) => {
  try {
      const companyId  = req.params.id;
      const data = await DataSync.getByCompanyId(companyId) 
      res.status(200).json({
        data,
        message: "get Datasync successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while syncData", error: error.message });
  }
};

//edit By DataSyncId
const editByDataSyncId = async (req, res) => {
  try {
    const userId = req.userId;
    const dataSyncId = req.params.id;
    const { body } = req;

    const dataSync = await DataSync.findById(dataSyncId)
    if (!dataSync) {
      res.status(400).json({ message: "DataSync Not Found" });
    }

    const updateDataSync = await DataSync.update(dataSyncId, body);
    return res.status(200).json({
      message: "Update company data successfully",
    });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving company", error: error.message });
  }
};

module.exports = { syncData, getDataSync, editByDataSyncId };
