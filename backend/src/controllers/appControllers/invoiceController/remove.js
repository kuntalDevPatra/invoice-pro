const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');
const ModelPayment = mongoose.model('Payment');

const remove = async (req, res) => {
  // Build query with user ownership filter for multi-tenancy
  const query = {
    _id: req.params.id,
    removed: false,
  };
  
  // Add user ownership filter if user is authenticated
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const deletedInvoice = await Model.findOneAndUpdate(
    query,
    {
      $set: {
        removed: true,
      },
    }
  ).exec();

  if (!deletedInvoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }
  const paymentsInvoices = await ModelPayment.updateMany(
    { invoice: deletedInvoice._id },
    { $set: { removed: true } }
  );
  return res.status(200).json({
    success: true,
    result: deletedInvoice,
    message: 'Invoice deleted successfully',
  });
};

module.exports = remove;
