const listAll = async (Model, req, res) => {
  const sort = req.query.sort || 'desc';
  const enabled = req.query.enabled || undefined;

  // Build base query with user ownership filter for multi-tenancy
  const baseQuery = {
    removed: false,
  };
  
  // Add data access filter from middleware
  if (req.dataAccessFilter) {
    Object.assign(baseQuery, req.dataAccessFilter);
  }
  
  if (enabled !== undefined) {
    baseQuery.enabled = enabled;
  }

  //  Query the database for a list of all results
  const result = await Model.find(baseQuery)
    .sort({ created: sort })
    .populate()
    .exec();

  if (result.length > 0) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = listAll;
