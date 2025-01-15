const getVersion = async (req, res) => {
    try {
      return res.status(200).json({version: process.env.API_VERSION });
    } catch (error) {
      return res.status(500).json({
        message: "Error getting version",
        error: error.message,
      });
    }
};

module.exports = {getVersion}