const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invoiceValidation = require('../../validations/invoice.validation');
const invoiceController = require('../../controllers/invoice.controller');

const router = express.Router();

router
  .route('/')
  .post(
    validate(invoiceValidation.createInvoice),
    invoiceController.createInvoice
  )
  .get(
    validate(invoiceValidation.getInvoices),
    invoiceController.getInvoices
  );

router
  .route('/:invoiceId')
  .get(
    validate(invoiceValidation.getInvoice),
    invoiceController.getInvoice
  )
  .patch(
    validate(invoiceValidation.updateInvoice),
    invoiceController.updateInvoice
  )
  .delete(
    validate(invoiceValidation.deleteInvoice),
    invoiceController.deleteInvoice
  );

// Consolidated patient/doctor specific routes
router
  .route('/:role/:userId')
  .get(
    validate(invoiceValidation.getInvoicesByRole), // Assuming a validation schema for this
    invoiceController.getInvoicesByRole
  );

// Get all invoices route
router
  .route('/all')
  .get(
    auth('getInvoices'),
    validate(invoiceValidation.getAllInvoices),
    invoiceController.getAllInvoices
  );

module.exports = router;
