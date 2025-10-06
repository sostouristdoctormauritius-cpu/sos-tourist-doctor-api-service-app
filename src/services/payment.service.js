const axios = require('axios');
const moment = require('../config/timezone');
const config = require('../config/config');
const dbManager = require('../db/dbManager');
const streamService = require('./stream.service');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createPaymentRequest = async (invoice, expiryInDays, title, customerUser) => {
  const nameParts = customerUser.name?.trim()?.split(/\s+/) ?? '';
  let firstName = '';
  let lastName = '';
  if (nameParts.length === 1) {
    firstName = nameParts[0];
  } else if (nameParts.length > 1) {
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  }

  const auth = {
    id_merchant: config.mips.idMerchant,
    id_entity: config.mips.idEntity,
    id_operator: config.mips.idOperator,
    operator_password: config.mips.operatorPassword
  };

  const paymentRequestData = {
    authentify: auth,
    request: {
      request_mode: 'simple',
      options: 'warranty',
      sending_mode: 'link',
      request_title: title,
      exp_date: moment().add(expiryInDays, 'day').format('YYYY-MM-DD'),
      client_details: {
        first_name: firstName,
        last_name: lastName,
        client_email: customerUser.email
      },
      client_other_data: [],
      order_other_data: [],
      balance_pattern: [
        {
          balance_number: 1,
          balance_mode: 'auto',
          condition: moment().add(expiryInDays, 'day').format('YYYY-MM-DD')
        }
      ]
    },
    initial_payment: {
      id_order: invoice.id.toString(),
      currency: invoice.currency,
      amount: invoice.amount
    }
  };

  const response = await axios.post(`${config.mips.baseUrl}/create_payment_request`, paymentRequestData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${config.mips.authUsername}:${config.mips.authPassword}`).toString('base64')}`
    }
  });

  return response.data;
};

const processPaymentCallback = async (cryptedCallback, mipsOrderId) => {
  const auth = {
    id_merchant: config.mips.idMerchant,
    id_entity: config.mips.idEntity,
    id_operator: config.mips.idOperator,
    operator_password: config.mips.operatorPassword
  };

  const decryptData = {
    authentify: auth,
    salt: config.mips.hashSalt,
    cipher_key: config.mips.cipherKey,
    received_crypted_data: cryptedCallback
  };

  const response = await axios.post(`${config.mips.baseUrl}/decrypt_imn_data`, decryptData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${config.mips.authUsername}:${config.mips.authPassword}`).toString('base64')}`
    }
  });

  const data = response.data;

  const invoice = await dbManager.findOne('invoices', { mipsIdOrder: mipsOrderId });
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }

  const newStatus = data.reason_fail ? 'payment_failed' : 'payment_completed';

  await dbManager.update('invoices', invoice.id, { status: newStatus, details: data });

  const appointment = await dbManager.findById('appointments', invoice.appointment);

  if (newStatus === 'payment_completed') {
    // Create Stream channel for the appointment if payment was successful
    const streamChannelId = await streamService.createChannel(appointment.user, appointment.doctor);
    await dbManager.update('appointments', appointment.id, { status: newStatus, streamChannelId });
  } else {
    await dbManager.update('appointments', appointment.id, { status: newStatus });
  }

  return !data.reason_fail;
};

module.exports = {
  createPaymentRequest,
  processPaymentCallback
};
