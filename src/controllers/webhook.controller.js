const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');

const handlePaymentWebhook = catchAsync(async (req, res) => {
  const { crypted_callback, id_order } = req.body;
  const result = await paymentService.processPaymentCallback(crypted_callback, id_order);
  res.status(200).send(result ? 'success' : 'fail');
});

module.exports = {
  handlePaymentWebhook
};
