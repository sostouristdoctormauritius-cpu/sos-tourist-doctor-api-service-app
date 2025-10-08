const adminService = require('./admin.service');
const appConfigService = require('./appConfig.service');
const appointmentService = require('./appointment.service');
const authService = require('./auth.service');
const availabilityService = require('./availability.service');
const patientService = require('./patient.service');

const dbHealthCheckService = require('./dbHealthCheck.service');
const doctorNoteService = require('./doctorNote.service');
const emailService = require('./email.service');
const invoiceService = require('./invoice.service');
const otpService = require('./otp.service');
const paymentService = require('./payment.service');
const prescriptionService = require('./prescription.service');
const realtimeService = require('./realtime.service');
const socketService = require('./socket.service');
const streamService = require('./stream.service');
const supabaseStorageService = require('./supabaseStorage.service');
const twilioService = require('./twilio.service');
const twilioVoiceService = require('./twilioVoice.service');
const vonageService = require('./vonage.service');
const smsService = require('./sms.service');
const userService = require('./user.service');
const tokenService = require('./token.service');

module.exports = {
  adminService,
  appConfigService,
  appointmentService,
  authService,
  availabilityService,
  dbHealthCheckService,
  doctorNoteService,
  emailService,
  invoiceService,
  otpService,
  patientService,
  paymentService,
  prescriptionService,
  realtimeService,
  socketService,
  streamService,
  supabaseStorageService,
  twilioService,
  twilioVoiceService,
  userService,
  vonageService,
  smsService,
  tokenService
};
