const search = async (Model, req, res) => {
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : ['name'];

  const fields = { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
  }

  // Build query with user ownership filter for multi-tenancy
  const baseQuery = {
    ...fields,
    removed: false,
  };
  
  // Add data access filter from middleware
  if (req.dataAccessFilter) {
    Object.assign(baseQuery, req.dataAccessFilter);
  }
  
  const query = Model.find(baseQuery);

  let results = await query.limit(20).exec();

  if (results.length >= 1) {
    return res.status(200).json({
      success: true,
      result: results,
      message: 'Successfully found all documents',
    });
  } else {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
      .end();
  }
};

module.exports = search;
