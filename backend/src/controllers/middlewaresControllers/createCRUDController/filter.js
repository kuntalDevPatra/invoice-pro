const filter = async (Model, req, res) => {
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'filter not provided correctly',
    });
  }
  
  // Build query with user ownership filter for multi-tenancy
  const query = Model.find({
    removed: false,
  }).where(req.query.filter).equals(req.query.equal);
  
  // Add user ownership filter if user is authenticated and model has createdBy field
  if (req.admin && req.admin._id && Model.schema.paths.createdBy) {
    query.where('createdBy', req.admin._id);
  }
  
  const result = await query.exec();
  
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
      message: 'Successfully found all documents  ',
    });
  }
};

module.exports = filter;
