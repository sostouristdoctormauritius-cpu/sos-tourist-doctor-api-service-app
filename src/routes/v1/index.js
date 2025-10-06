const express = require('express');
const path = require('path');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const doctorRoute = require('./doctor.route');
const patientRoute = require('./patient.route');
const adminRoute = require('./admin.route');
const appointmentRoute = require('./appointment.route');
const availabilityRoute = require('./availability.route');
const invoiceRoute = require('./invoice.route');
const communicationsRoute = require('./communications.route');
const healthRoute = require('./health.route');
const docsRoute = require('./docs.route');
const appConfigRoute = require('./appConfig.route');
const userPublicRoute = require('./user.public.route');
const publicDataRoute = require('./publicData.route');
const mobileRoute = require('./mobile.route');
const dashboardRoute = require('./dashboard.route');
const otpAuthRoute = require('./otpAuth.route');
const realtimeRoute = require('./realtime.route');
const sosRoute = require('./sos.route');
const testRoute = require('./test.route');
const webhookRoute = require('./webhook.route');
const twimlRoute = require('./twiml.route');
const chatRoute = require('./chat.route');

const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const router = express.Router();

// Public routes
router.use('/health', healthRoute);
router.use('/docs', docsRoute);
router.use('/app-configs', appConfigRoute);
router.use('/users/public', userPublicRoute);
router.use('/public', publicDataRoute);
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/login.html'));
});
router.use('/auth', authRoute);
router.use('/mobile', mobileRoute);

// Create protected routes with auth middleware applied individually
router.use('/users', auth(), userRoute);
router.use('/doctors', auth(), doctorRoute);
// Register appointment routes without global auth middleware since individual routes handle auth
router.use('/appointments', appointmentRoute);
// Register availability routes without global auth middleware since individual routes handle auth
router.use('/availabilities', availabilityRoute);
router.use('/invoices', auth(), invoiceRoute);
router.use('/dashboard', auth(), dashboardRoute);
router.use('/otp-auth', auth(), otpAuthRoute);
router.use('/realtime', auth(), realtimeRoute);
router.use('/sos', auth(), sosRoute);
router.use('/tests', auth(), testRoute);
router.use('/webhooks', auth(), webhookRoute);
router.use('/communications', auth(), communicationsRoute);
router.use('/patients', auth(), patientRoute);
router.use('/admins', auth(), adminRoute);
router.use('/twiml', auth(), twimlRoute);
router.use('/chat', chatRoute);

module.exports = router;
