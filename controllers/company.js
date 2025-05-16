const { AllCompany, AccountingData, User, Session } = require("../models");
const StripePayment = require("../stripe");

const getCompany = async (req, res) => {
  try {
    const { userId } = req;
    const userCompany = await AllCompany.getByUserId(userId);
    const sandboxCompany = await AllCompany.getByUserId("sandbox");
    res.json([...sandboxCompany, ...userCompany]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving company", error: error.message });
  }
};

const addSyncCompany = async (req, res) => {
  const { reason, companyName, companyId } = req.body;
  const userId = req.userId;
  //only Sync has companyId

  if (!companyName) {
    return res
      .status(400)
      .json({ message: "Company name is required" });
  }

  if(companyId === "sandbox") {
    res
      .status(500)
      .json({ message: "Can't edit the Sandbox company", error: error.message });
  }

  try {
    const {
      SOURCE_COMPANY: priceRuleId,
    } = process.env;

    const { stripeCustomerId } = await User.findByUserId(userId);
    const stripePayment = new StripePayment(); // Instantiate the class
    const createSession = await stripePayment.checkOut(
      priceRuleId,
      stripeCustomerId,
      userId,
      companyName,
    );
    const payment = await Session.create({
      userId,
      priceRuleId,
      currency: "usd",
      subscription: false,
      customerId: createSession.customer,
      sessionId: createSession.id,
      companyId,
      reason: reason === "Add" ? "CREATE_COMPANY" : "SYNC_COMPANY",
    });

    res.json({
      message: "Company checkout session successfully",
      sessionUrl: createSession.url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding company", error: error.message });
  }
};

const editCompany = async (req, res) => {
  try {
    const { companyId, accountingData, otherData } = req.body;

    const company = await AllCompany.findById(companyId);
    if (!company) {
      res.status(400).json({ message: "Company Not Found" });
    }

    if(companyId === "sandbox") {
      res
        .status(500)
        .json({ message: "Can't edit the Sandbox company", error: error.message });
    }

    if(accountingData) await AccountingData.updateByCompanyRefId(companyId, accountingData);
    await AllCompany.updateByCompanyRefId(companyId, otherData);

    return res.status(200).json({
      message: "Update company data successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving company", error: error.message });
  }
}

const getData = async (req, res) => {
  const { type, companyId, startMonth, endMonth } = req.body;
  const company = await AccountingData.findById(companyId);

  if(type == "get_accounting_balance_sheet") {
    const balanceSheet = company.balanceSheet.filter((data) => 
      new Date(startMonth) <= new Date(data.fromDateReport)
        && new Date(endMonth) >= new Date(data.toDateReport)
    )

    res.send(balanceSheet);
  }
  else if(type == "get_accounting_profit_loss") {
    const profitLoss = company.profitLoss.filter((data) => 
      new Date(startMonth) <= new Date(data.fromDateReport)
        && new Date(endMonth) >= new Date(data.toDateReport)
    )

    res.send(profitLoss);
  }
}

const verifyLink = async (req, res) => {
  const { userId, companyName } = req.body;
  const companyData = await AllCompany.findByUserIdCompanyName(userId, companyName);
  const companyId = companyData?.status === "PENDING" ? companyData.id : "";
  res.send(companyId);
}

const editCompanyByIdForCodat = async (req, res) => {
  res.status(200).json({
    message: "Update company data successfully",
  });
};

module.exports = { addSyncCompany, getCompany, editCompany, getData, verifyLink, editCompanyByIdForCodat };