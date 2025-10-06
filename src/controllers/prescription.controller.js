const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { prescriptionService } = require('../services');
const pick = require('../utils/pick');

const createPrescription = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.body);
  res.status(httpStatus.CREATED).send(prescription);
});

const getPrescriptions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['patient', 'doctor', 'appointment']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await prescriptionService.queryPrescriptions(filter, options);
  res.send(result);
});

const getPrescriptionsFiltered = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['patient', 'doctor', 'appointment']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Determine the specific filter based on the request context
  if (req.user && req.user._id) {
    // If authenticated user, assume it's for 'my' prescriptions
    filter.patient = req.user._id;
  } else if (req.params.patientId) {
    filter.patient = req.params.patientId;
  } else if (req.params.doctorId) {
    filter.doctor = req.params.doctorId;
  }

  const result = await prescriptionService.queryPrescriptions(filter, options);
  res.send(result);
});

const getPrescriptionByAppointment = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionByAppointment(req.params.appointmentId);
  res.send(prescription);
});

const getPrescription = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.prescriptionId);
  res.send(prescription);
});

const updatePrescription = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.updatePrescriptionById(req.params.prescriptionId, req.body);
  res.send(prescription);
});

const deletePrescription = catchAsync(async (req, res) => {
  await prescriptionService.deletePrescriptionById(req.params.prescriptionId);
  res.status(httpStatus.NO_CONTENT).send();
});

const downloadPrescriptionPdf = catchAsync(async (req, res) => {
  const pdfBuffer = await prescriptionService.generatePrescriptionPdf(req.params.prescriptionId);
  res.setHeader('Content-Disposition', `attachment; filename=prescription-${req.params.prescriptionId}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  res.end(pdfBuffer);
});

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionsFiltered,
  getPrescriptionByAppointment,
  getPrescription,
  updatePrescription,
  deletePrescription,
  downloadPrescriptionPdf
};
