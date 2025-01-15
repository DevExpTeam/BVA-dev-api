const { Admin } = require("../models");

const getSettings = async (req, res) => {
  try {
    const settings = await Admin.getSettings();
    res.json(settings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving global user settings", error: error.message });
  }
};

const updateSettings = async (req, res) => {
  const { data } = req.body;

  try {
    await Admin.updateSettings(data);
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating global user settings", error: error.message });
  }
};

module.exports = { getSettings, updateSettings };
