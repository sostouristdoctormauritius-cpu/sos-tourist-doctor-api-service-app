const allRoles = {
  user: [
    'updateProfile', 'bookAppointments', 'getUserSelfInvoices'
  ],
  doctor: [
    'updateProfile', 'manageAvailability',
    'bookAppointments', 'manageAppointments',
    'manageInvoices', 'getDoctorSelfInvoices',
    'getDoctorNotes', 'manageDoctorNotes',
    'getPrescriptions', 'managePrescriptions'
  ],
  admin: [
    'updateProfile', 'getUsers', 'manageUsers', 'manageDoctors', 'manageAppConfigs',
    'manageAvailability', 'manageDoctorsAvailability',
    'bookAppointments', 'manageAppointments', 'manageDoctorsAppointments',
    'manageInvoices', 'getUserSelfInvoices', 'getDoctorSelfInvoices',
    'getDoctorNotes', 'manageDoctorNotes',
    'getPrescriptions', 'managePrescriptions', 'getDoctors'
  ]
};
const extraRights = {
  verifyOtp: true
};
const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
  extraRights
};
