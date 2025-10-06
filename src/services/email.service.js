const config = require('../config/config');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transport = nodemailer.createTransport(
  smtpTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass
    }
  })
);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  logger.info('Sending email to:', to, 'with subject:', subject);
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${config.portal.baseUrl}reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  sendEmail(to, subject, text);
};

const sendOtpEmail = async (to, otp) => {
  logger.info('Sending OTP email to:', to);

  const subject = 'Your OTP Code';

  const text = `
Hello,

Your One-Time Password (OTP) is: ${otp.otp}

This code is valid for ${config.otpExpiryMinutes} minutes. Please do not share it with anyone.

Best regards,  
SOS Team
  `.trim();

  // It's important that sendEmail supports the 'from' address
  await sendEmail(to, subject, text);
};

// const sendOtpEmail = async (to, otp) => {
//   console.log("otp send " , to , otp);
//   const subject = 'Otp';

//   const text = `Dear user,
//   your otp is ${otp.otp}`;
//   sendEmail(to, subject, text);
// };
/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${config.portal.baseUrl}verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  sendEmail(to, subject, text);
};

/**
 * Send an invitation email
 * @param {string} to - The recipient's email address
 * @param {string} token - The invitation token
 * @param {string} role - The role assigned to the invited user
 * @returns {Promise}
 */
const sendInvitationEmail = async (to, token, role) => {
  logger.info('Sending invitation email to:', to, 'for role:', role);
  const subject = 'You are invited to join our platform';
  const registrationUrl = `${config.portal.baseUrl}registration?token=${token}`;
  const text = `Dear user,
  
You have been invited to join our platform as ${role}. Please click on the link below to complete your registration:

${registrationUrl}

If you did not expect this invitation, please ignore this email.`;

  await sendEmail(to, subject, text);
};

/**
 * Send deletion request email
 * @param {string} to - The recipient's email address
 * @param {string} token - The deletion token
 * @returns {Promise}
 */
const sendDeletionRequestEmail = async (to, token) => {
  const deletionUrl = `${config.portal.baseUrl}/complete-profile-deletion?token=${token}`;
  const expirationHours = config.userDeletionRequestExpiryHours;

  const subject = 'Important: Confirm Your Profile Deletion Request';
  const emailBody = `Dear user,

We have received a request to delete your profile associated with this email address. Please note that deleting your profile is a permanent action and cannot be undone. This means that all your data, including any appointments, notes, and other associated information, will be archived and will no longer be accessible.

If you are sure that you want to delete your profile, please click the link below to proceed with the deletion:

${deletionUrl}

This link will expire in ${expirationHours} hours, after which you will need to request deletion again if you do not complete the process.

If you did not request this action, you can safely ignore this email, and your profile will remain active.

Thank you for using our services.

Best regards,
SOS Tourist Doctor Support Team`;

  await sendEmail(to, subject, emailBody);
};

// Email for the user (patient)
const sendUserAppointmentStatusChangeEmail = async ({
  recipient,
  name,
  status,
  date,
  time,
  doctorName
}) => {
  const statusMessages = {
    pending_payment: 'Your appointment is pending payment.',
    payment_completed: `Your appointment has been confirmed with Dr. ${doctorName} for ${date} at ${time}.`,
    payment_failed: 'Your payment for the appointment has failed.',
    confirmed: `Your appointment with Dr. ${doctorName} has been confirmed for ${date} at ${time}.`,
    completed: 'Your appointment has been marked as completed.',
    cancelled: 'Your appointment has been cancelled.'
  };

  const message = statusMessages[status];

  await sendEmail(
    recipient,
    `Appointment Status Update - ${status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')}`,
    `Hello ${name},\n\n${message}\n\nThank you,\nSOS Tourist Doctor`
  );
};

// Email for the doctor
const sendDoctorAppointmentStatusChangeEmail = async ({
  recipient,
  name,
  status,
  date,
  time,
  patientName
}) => {
  const statusMessages = {
    payment_completed: `You have an appointment with ${patientName} on ${date} at ${time}.`,
    cancelled: `The appointment with ${patientName} on ${date} at ${time} has been cancelled.`
  };

  const message = statusMessages[status];

  await sendEmail(
    recipient,
    `New Appointment Notification - ${status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')}`,
    `Hello Dr. ${name},\n\n${message}\n\nBest regards,\nSOS Tourist Doctor`
  );
};

const sendDoctorChangedNotificationToPatient = async ({
  recipient,
  patientName,
  newDoctorName,
  appointmentDate,
  startTime
}) => {
  const subject = `Appointment Update: Your Doctor Has Been Changed to Dr. ${newDoctorName}`;
  const message = `Hello ${patientName},\n\nYour appointment has been updated and the new doctor assigned to you is Dr. ${newDoctorName}. Your appointment remains scheduled for ${appointmentDate} at ${startTime}.\n\nThank you,\nSOS Tourist Doctor`;

  await sendEmail(recipient, subject, message);
};

const sendDoctorChangedNotificationToDoctor = async ({
  recipient,
  doctorName,
  patientName,
  appointmentDate,
  startTime
}) => {
  const subject = `New Appointment Assigned for ${appointmentDate}`;
  const message = `Hello Dr. ${doctorName},\n\nYou have been assigned a new appointment with ${patientName} scheduled for ${appointmentDate} at ${startTime}.\n\nPlease make necessary preparations.\n\nThank you,\nSOS Tourist Doctor`;

  await sendEmail(recipient, subject, message);
};

const sendAppointmentReassignedNotificationToPreviousDoctor = async ({
  recipient,
  previousDoctorName,
  patientName,
  newDoctorName,
  appointmentDate,
  startTime
}) => {
  const subject = `Appointment Reassigned - ${appointmentDate}`;
  const message = `Hello Dr. ${previousDoctorName},\n\nThe appointment with patient ${patientName} scheduled for ${appointmentDate} at ${startTime} has been reassigned to Dr. ${newDoctorName}.\n\nThank you,\nSOS Tourist Doctor`;

  await sendEmail(recipient, subject, message);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendInvitationEmail,
  sendDeletionRequestEmail,
  sendUserAppointmentStatusChangeEmail,
  sendDoctorAppointmentStatusChangeEmail,
  sendDoctorChangedNotificationToPatient,
  sendDoctorChangedNotificationToDoctor,
  sendAppointmentReassignedNotificationToPreviousDoctor,
  sendOtpEmail
};
