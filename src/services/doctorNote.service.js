const dbManager = require('../db/dbManager');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createDoctorNote = async (doctorNoteBody) => {
  return dbManager.create('doctorNotes', doctorNoteBody);
};

const queryDoctorNotes = async (filter, options) => {
  const doctorNotes = await dbManager.paginate('doctorNotes', filter, options);
  return doctorNotes;
};

const getDoctorNoteById = async (id) => {
  return dbManager.findById('doctorNotes', id);
};

const updateDoctorNoteById = async (doctorNoteId, updateBody) => {
  const doctorNote = await getDoctorNoteById(doctorNoteId);
  if (!doctorNote) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor note not found');
  }
  await dbManager.update('doctorNotes', doctorNoteId, updateBody);
  return { ...doctorNote, ...updateBody };
};

const deleteDoctorNoteById = async (doctorNoteId) => {
  const doctorNote = await getDoctorNoteById(doctorNoteId);
  if (!doctorNote) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor note not found');
  }
  await dbManager.delete('doctorNotes', doctorNoteId);
  return doctorNote;
};

const getDoctorNotesByPatient = async (patientId) => {
  return dbManager.findMany('doctorNotes', { patient: patientId });
};

const getDoctorNoteByAppointment = async (appointmentId) => {
  return dbManager.findOne('doctorNotes', { appointment: appointmentId });
};

module.exports = {
  createDoctorNote,
  queryDoctorNotes,
  getDoctorNoteById,
  updateDoctorNoteById,
  deleteDoctorNoteById,
  getDoctorNotesByPatient,
  getDoctorNoteByAppointment
};
