const summary = async (Model, req, res) => {
  // Build base query with user ownership filter for multi-tenancy
  const baseQuery = {
    removed: false,
  };
  
  // Add data access filter from middleware
  if (req.dataAccessFilter) {
    Object.assign(baseQuery, req.dataAccessFilter);
  }

  //  Query the database for a list of all results
  const countPromise = Model.countDocuments(baseQuery);

  const filterQuery = { ...baseQuery };
  if (req.query.filter && req.query.equal) {
    filterQuery[req.query.filter] = req.query.equal;
  }
  
  const resultsPromise = Model.countDocuments(filterQuery).exec();
  
  // Resolving both promises
  const [countFilter, countAllDocs] = await Promise.all([resultsPromise, countPromise]);

  if (countAllDocs > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully count all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = summary;
