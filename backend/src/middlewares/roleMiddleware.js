const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.admin?.role;
    
    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No role found.',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

const ownerOnly = roleMiddleware(['owner']);
const ownerAndUser = roleMiddleware(['owner', 'user']);

module.exports = {
  roleMiddleware,
  ownerOnly,
  ownerAndUser,
};