const { Source } = require("../models");

const addSource = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Name, initial sync fee, and sync fee are required" });
  }

  try {
    const userId = req.userId;
    const newSource = await Source.create({
      name,
      userId,
    });
    res.json({ message: "Source added successfully", source: newSource });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding source", error: error.message });
  }
};

const getSources = async (req, res) => {
  try {
    const sources = await Source.getAll();
    res.json({ sources });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving sources", error: error.message });
  }
};

const editsSources = async (req, res) => {
  try {
    const sourceId = req.params.id;
    const { body } = req;
    const sources = await Source.updateBySourceRefId(sourceId, body);
    res.status(200).json({ message: "update source data successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating source", error: error.message });
  }
};

module.exports = { addSource, getSources, editsSources };
