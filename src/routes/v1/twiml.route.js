const express = require('express');
const router = express.Router();
const logger = require('../../config/logger');

/**
 * Generate TwiML for incoming calls
 */
router.post('/voice', (req, res) => {
  try {
    // Set content type for TwiML
    res.type('text/xml');

    // Get parameters from the request
    const { Caller, Called } = req.body;
    logger.info('Incoming voice call', { Caller, Called });

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling SOS Tourist Doctor. A doctor will be with you shortly.</Say>
  <Dial>
    <Number>${process.env.TWILIO_FORWARD_NUMBER || Called}</Number>
  </Dial>
</Response>`;

    res.send(twiml);
  } catch (error) {
    logger.error('Error generating TwiML', { error: error.message });
    res.status(500).send('Error generating call response');
  }
});

/**
 * Generate TwiML for outgoing calls to patients
 */
router.post('/patient-call', (req, res) => {
  try {
    // Set content type for TwiML
    res.type('text/xml');

    // Get parameters from the request
    const { doctorName } = req.body;
    logger.info('Outgoing patient call', { doctorName });

    // Generate TwiML response for outgoing calls
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello, this is a call from SOS Tourist Doctor. Doctor ${doctorName} is calling for your appointment.</Say>
  <Say voice="alice">Please hold while we connect you.</Say>
  <Dial>
    <Conference>${Date.now()}_patient_consultation</Conference>
  </Dial>
</Response>`;

    res.send(twiml);
  } catch (error) {
    logger.error('Error generating patient call TwiML', { error: error.message });
    res.status(500).send('Error generating call response');
  }
});

module.exports = router;
