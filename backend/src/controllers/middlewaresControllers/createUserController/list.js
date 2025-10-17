const mongoose = require('mongoose');

const list = async (userModel, req, res) => {
  try {
    const Model = mongoose.model(userModel);
    const result = await Model.find({ removed: false })
      .select('-__v')
      .sort({ created: -1 });

    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all documents',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = list;