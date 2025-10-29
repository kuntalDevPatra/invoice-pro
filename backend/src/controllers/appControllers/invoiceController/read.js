const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const read = async (req, res) => {
  // Build query with user ownership filter for multi-tenancy
  const query = {
    _id: req.params.id,
    removed: false,
  };
  
  // Add data access filter from middleware
  if (req.dataAccessFilter) {
    Object.assign(query, req.dataAccessFilter);
  }

  // Find document by id
  const result = await Model.findOne(query)
    .populate('createdBy', 'name')
    .exec();
  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // Return success resposne
    return res.status(200).json({
      success: true,
      result,
      message: 'we found this document ',
    });
  }
};

module.exports = read;
