const mongoose = require('mongoose');

const addDataAccessFilter = (req, res, next) => {
  const userRole = req.admin?.role;
  const userId = req.admin?._id;

  if (!userRole || !userId) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. User not authenticated.',
    });
  }

  // Add data access filter to request
  const userCompany = req.admin?.company;
  
  if (userRole === 'owner') {
    // Owners can see all data from their company (admin-level access)
    req.dataAccessFilter = {
      company: userCompany
    };
  } else {
    // Users can only see their own data within their company
    req.dataAccessFilter = {
      company: userCompany,
      createdBy: userId
    };
  }

  next();
};

const addCreatedByField = (req, res, next) => {
  const userId = req.admin?._id;
  const userCompany = req.admin?.company;
  
  if (userId && req.body) {
    req.body.createdBy = userId.toString();
  }
  
  if (userCompany && req.body) {
    req.body.company = userCompany.toString();
  }
  
  next();
};

module.exports = {
  addDataAccessFilter,
  addCreatedByField,
};