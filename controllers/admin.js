const { auth, db } = require("../firebase");
const { User } = require("../models");

const getSettings = async (req, res) => {
  try {
    const userCompany = await AllCompany.getByUserId(userId);
    const sandboxCompany = await AllCompany.getByUserId("sandbox");
    res.json([...sandboxCompany, ...userCompany]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving company", error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userCompany = await AllCompany.getByUserId(userId);
    const sandboxCompany = await AllCompany.getByUserId("sandbox");
    res.json([...sandboxCompany, ...userCompany]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving company", error: error.message });
  }
};

module.exports = { getSettings, updateSettings };
