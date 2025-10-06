const express = require('express');
const { webhookController } = require('../../controllers');

const router = express.Router();

router.post('/payment', webhookController.handlePaymentWebhook);

module.exports = router;
