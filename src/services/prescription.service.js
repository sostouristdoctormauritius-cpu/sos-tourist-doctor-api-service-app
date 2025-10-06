const dbManager = require('../db/dbManager');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
// const puppeteer = require('puppeteer'); // Commented out as puppeteer is not installed
const userService = require('./user.service');

const createPrescription = async (prescriptionBody) => {
  return dbManager.create('prescriptions', prescriptionBody);
};

const queryPrescriptions = async (filter, options) => {
  const prescriptions = await dbManager.paginate('prescriptions', filter, options);
  return prescriptions;
};

const getPrescriptionById = async (id) => {
  return dbManager.findById('prescriptions', id, [
    'doctor',
    'patient',
    { path: 'doctor', select: 'doctor_profile->>specialisation,doctor_profile->>address' },
    { path: 'patient', select: 'user_profile->>phoneNumber' }
  ]);
};

const updatePrescriptionById = async (prescriptionId, updateBody) => {
  const prescription = await getPrescriptionById(prescriptionId);
  if (!prescription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }
  await dbManager.update('prescriptions', prescriptionId, updateBody);
  return { ...prescription, ...updateBody };
};

const deletePrescriptionById = async (prescriptionId) => {
  const prescription = await getPrescriptionById(prescriptionId);
  if (!prescription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }
  await dbManager.delete('prescriptions', prescriptionId);
  return prescription;
};

const generatePrescriptionPdf = async (prescriptionId) => {
  const prescription = await getPrescriptionById(prescriptionId);
  if (!prescription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }

  // Explicitly fetch patient and doctor details
  const patient = await userService.getUserById(prescription.patient);
  const doctor = await userService.getUserById(prescription.doctor);

  if (!patient || !doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient or Doctor not found for this prescription');
  }

  const templatePath = path.join(__dirname, '../templates/prescription-template.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  const template = handlebars.compile(templateHtml);
  const html = template({
    patientName: patient.name,
    patientAge: new Date().getFullYear() - new Date(patient.user_profile.dob).getFullYear(),
    patientGender: patient.user_profile.gender,
    doctorName: doctor.name,
    doctorSpecialisation: doctor.doctor_profile.specialisation,
    doctorAddress: doctor.doctor_profile.address,
    doctorContact: patient.user_profile.phoneNumber, // Assuming this is patient's phone number
    prescriptionDate: new Date(prescription.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    medications: prescription.medications.map(medication => ({
      name: medication.name,
      dosage: medication.dosage,
      strength: medication.strength,
      duration: medication.duration,
      idealTimes: medication.idealTimes.join(', ')
    }))
  });

  // PDF generation disabled due to missing puppeteer dependency
  // const browser = await puppeteer.launch({
  //   headless: true,
  //   args: ['--no-sandbox', '--disable-setuid-sandbox']
  // });

  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdfBuffer = await page.pdf({ format: 'A4' });
  // await browser.close();

  // return pdfBuffer;

  // Return HTML content as fallback
  return Buffer.from(html, 'utf8');
};

module.exports = {
  createPrescription,
  queryPrescriptions,
  getPrescriptionById,
  updatePrescriptionById,
  deletePrescriptionById,
  generatePrescriptionPdf
};
