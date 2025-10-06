const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { doctorNoteService } = require('../services');
const pick = require('../utils/pick');

const createDoctorNote = catchAsync(async (req, res) => {
  const doctorNote = await doctorNoteService.createDoctorNote(req.body);
  res.status(httpStatus.CREATED).send(doctorNote);
});

const getDoctorNotes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['patient', 'doctor', 'appointment']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await doctorNoteService.queryDoctorNotes(filter, options);
  res.send(result);
});

const getDoctorNote = catchAsync(async (req, res) => {
  const doctorNote = await doctorNoteService.getDoctorNoteById(req.params.doctorNoteId);
  res.send(doctorNote);
});

const getDoctorNotesByPatient = catchAsync(async (req, res) => {
  const doctorNotes = await doctorNoteService.getDoctorNotesByPatient(req.params.patientId);
  res.send(doctorNotes);
});

const getDoctorNoteByAppointment = catchAsync(async (req, res) => {
  const doctorNote = await doctorNoteService.getDoctorNoteByAppointment(req.params.appointmentId);
  res.send(doctorNote);
});

const updateDoctorNote = catchAsync(async (req, res) => {
  const doctorNote = await doctorNoteService.updateDoctorNoteById(req.params.doctorNoteId, req.body);
  res.send(doctorNote);
});

const deleteDoctorNote = catchAsync(async (req, res) => {
  await doctorNoteService.deleteDoctorNoteById(req.params.doctorNoteId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDoctorNote,
  getDoctorNotes,
  getDoctorNote,
  getDoctorNotesByPatient,
  getDoctorNoteByAppointment,
  updateDoctorNote,
  deleteDoctorNote
};
