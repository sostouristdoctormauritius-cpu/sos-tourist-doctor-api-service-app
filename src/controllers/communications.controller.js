const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');
const { makeVoiceCall } = require('../services/twilioVoice.service');
const dbManager = require('../db/dbManager');
const ApiError = require('../utils/ApiError');

/**
 * Initiate a call between doctor and patient
 */
const initiateCall = catchAsync(async (req, res) => {
  try {
    const { patientId, doctorId, callType } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate request
    if (!patientId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    if (!doctorId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Failed to initiate call with Test User: No doctor selected or available'
      });
    }

    // Check if user is authorized to initiate call (doctor/admin)
    if (userId !== doctorId && req.user.role !== 'admin') {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to initiate call for this doctor'
      });
    }

    // Get patient details from database
    const patient = await dbManager.findById('users', patientId);
    if (!patient) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get doctor details from database
    const doctor = await dbManager.findById('users', doctorId);
    if (!doctor) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // For voice calls, make an actual phone call using Twilio
    if (callType === 'voice' && patient.phone) {
      try {
        const callResult = await makeVoiceCall(patient.phone, doctor.name);
        logger.info('Voice call initiated successfully', {
          callSid: callResult.sid,
          patientId,
          doctorId,
          toPhoneNumber: patient.phone
        });

        return res.status(httpStatus.OK).json({
          success: true,
          message: 'Voice call initiated successfully',
          data: {
            callSid: callResult.sid,
            toPhoneNumber: patient.phone,
            fromPhoneNumber: process.env.TWILIO_PHONE_NUMBER
          }
        });
      } catch (callError) {
        logger.error('Error making voice call', { error: callError.message });
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to initiate voice call: ' + callError.message
        });
      }
    }

    // For video/online calls, use Stream
    // In a real implementation, you would:
    // 1. Check if patient and doctor exist
    // 2. Create or get a Stream channel for the call
    // 3. Notify the patient about the incoming call

    // For this implementation, we'll simulate creating a call session
    const channelId = `call_${uuidv4()}`;
    const callSession = {
      id: channelId,
      patientId,
      doctorId,
      callType: callType || 'video',
      status: 'initiated',
      createdAt: new Date().toISOString()
    };

    logger.info('Call initiated', {
      channelId,
      patientId,
      doctorId,
      userId,
      callType
    });

    // Return success response
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Call initiated successfully',
      data: callSession
    });
  } catch (error) {
    logger.error('Error initiating call', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error while initiating call'
    });
  }
});

/**
 * End a call between doctor and patient
 */
const endCall = catchAsync(async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!callId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Call ID is required'
      });
    }

    // In a real implementation, you would:
    // 1. Update the call status in database
    // 2. Disconnect the call in Stream/Twilio
    // 3. Calculate call duration

    logger.info('Call ended', { callId, userId });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Call ended successfully',
      data: {
        callId,
        status: 'ended',
        endedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error ending call', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error while ending call'
    });
  }
});

/**
 * Send a message between doctor and patient
 */
const sendMessage = catchAsync(async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;

    // Validate request
    if (!recipientId || !message) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Recipient ID and message are required'
      });
    }

    // Get sender details
    const sender = await dbManager.findById('users', senderId);
    if (!sender) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Sender not found'
      });
    }

    // Get recipient details
    const recipient = await dbManager.findById('users', recipientId);
    if (!recipient) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // In a real implementation, you would:
    // 1. Save message to database
    // 2. Send message via Stream/Twilio

    const messageId = uuidv4();
    const messageData = {
      id: messageId,
      senderId,
      recipientId,
      content: message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    logger.info('Message sent', { messageId, senderId, recipientId });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Message sent successfully',
      data: messageData
    });
  } catch (error) {
    logger.error('Error sending message', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error while sending message'
    });
  }
});

/**
 * Get communication history for a patient
 */
const getCommunicationHistory = catchAsync(async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Validate request
    if (!patientId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Check if user is authorized to view communication history
    if (userId !== patientId && req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to view communication history for this patient'
      });
    }

    // In a real implementation, you would:
    // 1. Query database for communication history
    // 2. Filter by patientId
    // 3. Return sorted results

    // Simulating communication history
    const communicationHistory = [
      {
        id: uuidv4(),
        type: 'call',
        participantIds: [userId, patientId],
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'completed',
        duration: 120 // seconds
      },
      {
        id: uuidv4(),
        type: 'message',
        participantIds: [userId, patientId],
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        content: 'Hello, how can I help you today?',
        status: 'read'
      }
    ];

    logger.info('Communication history retrieved', { patientId, userId });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Communication history retrieved successfully',
      data: communicationHistory
    });
  } catch (error) {
    logger.error('Error retrieving communication history', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error while retrieving communication history'
    });
  }
});

module.exports = {
  initiateCall,
  endCall,
  sendMessage,
  getCommunicationHistory
};
