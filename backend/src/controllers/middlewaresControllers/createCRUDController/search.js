const search = async (Model, req, res) => {
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : ['name'];

  const fields = { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
  }

  // Build query with user ownership filter for multi-tenancy
  const query = Model.find({
    ...fields,
  }).where('removed', false);
  
  // Add user ownership filter if user is authenticated and model has createdBy field
  if (req.admin && req.admin._id && Model.schema.paths.createdBy) {
    query.where('createdBy', req.admin._id);
  }

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
