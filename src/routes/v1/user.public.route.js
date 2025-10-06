const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

// Public routes - no authentication required
router
  .route('/doctors')
  .get(validate(userValidation.getUsers), userController.getDoctors);

router
  .route('/clients')
  .get((req, res) => {
    // Mock data - in a real implementation, this would come from the database
    const clients = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'active', created_at: '2025-08-01T10:30:00Z' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'patient', status: 'active', created_at: '2025-08-02T14:15:00Z' },
      { id: '3', name: 'Robert Johnson', email: 'robert@example.com', role: 'patient', status: 'pending', created_at: '2025-08-03T09:45:00Z' },
      { id: '4', name: 'Emily Williams', email: 'emily@example.com', role: 'patient', status: 'active', created_at: '2025-08-04T16:20:00Z' }
    ];
    res.json(clients);
  });

// Enhanced doctors route with filtering capabilities
router
  .route('/doctors/search')
  .get(validate(userValidation.getDoctorsWithFilters), userController.getDoctorsWithFilters);

// Get doctor by ID
router
  .route('/doctors/:doctorId')
  .get(validate(userValidation.getDoctorById), userController.getDoctorById);

module.exports = router;
