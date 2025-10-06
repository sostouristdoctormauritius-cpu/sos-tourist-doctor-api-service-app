const moment = require('../config/timezone');
const dbManager = require('../db/dbManager');
const realtimeService = require('./realtime.service');
const logger = require('../config/logger');

/**
 * Get available slots between a date range.
 * @param {String} start
 * @param {String} end
 * @param {String} [doctorId]
 * @param {String} [consultationType]
 * @returns {Object}
 */
const getAvailableSlots = async (start, end, doctorId, consultationType) => {
  const startDate = moment(start).startOf('day');
  const endDate = moment(end).endOf('day');

  // Construct the query object
  const query = {
    $or: [
      {
        isRecurring: false,
        startDate: { $lte: endDate.toDate() },
        endDate: { $gte: startDate.toDate() }
      },
      {
        isRecurring: true,
        startDate: { $lte: endDate.toDate() },
        recurrenceEndDate: { $gte: startDate.toDate() }
      }
    ]
  };

  // If doctorId is provided, add it to the query
  if (doctorId) {
    query.user = doctorId;
  }

  // If consultationType is provided, add it to the query
  if (consultationType) {
    // Remove $elemMatch as it's not directly supported by current Supabase adapter
    // Filtering will be done in application logic after fetching
  }

  // Find availabilities and populate the user reference
  const availabilities = await dbManager.findMany('availabilities', query, [{
    path: 'user',
    select: 'doctor_profile->>is_listed'
  }]);

  // Filter availabilities by consultationType in application logic
  const filteredAvailabilities = availabilities.filter(av => {
    const doctorIsListed = av.user && av.user.doctor_profile && av.user.doctor_profile.is_listed;
    const hasMatchingConsultationType = !consultationType || (av.consultationTypes && av.consultationTypes.includes(consultationType));
    return doctorIsListed && hasMatchingConsultationType;
  });

  const appointments = await dbManager.findMany('appointments', {
    date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    status: { $ne: 'cancelled' }
  });

  const availableSlots = {};

  for (let date = moment(startDate); date.isSameOrBefore(endDate, 'day'); date.add(1, 'day')) {
    availableSlots[date.format('YYYY-MM-DD')] = {
      morning: [],
      afternoon: []
    };

    filteredAvailabilities.forEach(av => {
      if (!av.isRecurring && moment(av.startDate).isSameOrBefore(date) && moment(av.endDate).isSameOrAfter(date)) {
        // Non-recurring availability
        generateSlots(availableSlots, date, av.startTime, av.endTime);
      } else if (av.isRecurring) {
        // Recurring availability
        const currentDate = moment(av.startDate);
        while (currentDate.isSameOrBefore(date) && currentDate.isSameOrBefore(av.recurrenceEndDate)) {
          if (currentDate.isSame(date, 'day')) {
            generateSlots(availableSlots, date, av.startTime, av.endTime);
          }
          currentDate.add(1, av.recurrence === 'daily' ? 'days' : av.recurrence === 'weekly' ? 'weeks' : 'months');
        }
      }
    });

    // Remove slots that are already booked
    const dayAppointments = appointments.filter(appt => moment(appt.date).isSame(date, 'day'));
    dayAppointments.forEach(appt => {
      removeBookedSlot(availableSlots[date.format('YYYY-MM-DD')], appt.startTime, appt.endTime);
    });
  }

  return availableSlots;
};

const generateSlots = (availableSlots, date, startTime, endTime) => {
  const currentTime = moment(`${date.format('YYYY-MM-DD')} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const end = moment(`${date.format('YYYY-MM-DD')} ${endTime}`, 'YYYY-MM-DD HH:mm');

  while (currentTime.isSameOrBefore(end)) {
    const slot = currentTime.format('HH:mm');
    if (currentTime.hours() < 12) {
      availableSlots[date.format('YYYY-MM-DD')].morning.push(slot);
    } else {
      availableSlots[date.format('YYYY-MM-DD')].afternoon.push(slot);
    }
    currentTime.add(30, 'minutes');
  }
};

const removeBookedSlot = (slots, startTime, endTime) => {
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');

  for (let time = start; time.isSameOrBefore(end); time.add(30, 'minutes')) {
    const slot = time.format('HH:mm');
    slots.morning = slots.morning.filter(s => s !== slot);
    slots.afternoon = slots.afternoon.filter(s => s !== slot);
  }
};

/**
 * Create an availability
 * @param {Object} availabilityBody
 * @returns {Promise<Availability>}
 */
const createAvailability = async (availabilityBody) => {
  try {
    // Handle alternative field names
    const availabilityData = { ...availabilityBody };

    // Ensure we have the correct field names
    if (!availabilityData.doctor_id && availabilityData.user_id) {
      availabilityData.doctor_id = availabilityData.user_id;
    }

    if (!availabilityData.date && availabilityData.start_date) {
      availabilityData.date = availabilityData.start_date;
    }

    if (!availabilityData.end_time && availabilityData.end_date) {
      availabilityData.end_time = availabilityData.end_date;
    }

    // Remove alternative field names to avoid confusion
    delete availabilityData.user_id;
    delete availabilityData.start_date;
    delete availabilityData.end_date;

    // Process consultation_types if provided
    if (availabilityData.consultation_types) {
      availabilityData.consultationTypes = availabilityData.consultation_types;
      delete availabilityData.consultation_types;
    }

    logger.info('Creating availability with data:', availabilityData);

    const availability = await dbManager.create('availabilities', availabilityData);

    // Notify about the new availability
    await realtimeService.notifyAvailabilityChange(availability);

    return availability;
  } catch (error) {
    logger.error('Error in createAvailability service:', error);
    throw error;
  }
};

/**
 * Update availability by id
 * @param {ObjectId} availabilityId
 * @param {Object} updateBody
 * @returns {Promise<Availability>}
 */
const updateAvailability = async (availabilityId, updateBody) => {
  try {
    // Handle alternative field names
    const updateData = { ...updateBody };

    // Ensure we have the correct field names
    if (!updateData.doctor_id && updateData.user_id) {
      updateData.doctor_id = updateData.user_id;
    }

    if (!updateData.date && updateData.start_date) {
      updateData.date = updateData.start_date;
    }

    if (!updateData.end_time && updateData.end_date) {
      updateData.end_time = updateData.end_date;
    }

    // Remove alternative field names to avoid confusion
    delete updateData.user_id;
    delete updateData.start_date;
    delete updateData.end_date;

    // Process consultation_types if provided
    if (updateData.consultation_types) {
      updateData.consultationTypes = updateData.consultation_types;
      delete updateData.consultation_types;
    }

    logger.info('Updating availability with data:', { availabilityId, updateData });

    const availability = await dbManager.update('availabilities', availabilityId, updateData);

    if (!availability) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Availability not found');
    }

    // Notify about the updated availability
    await realtimeService.notifyAvailabilityChange(availability);

    return availability;
  } catch (error) {
    logger.error('Error in updateAvailability service:', error);
    throw error;
  }
};

/**
 * Delete availability by id
 * @param {ObjectId} availabilityId
 * @returns {Promise<Availability>}
 */
const deleteAvailability = async (availabilityId) => {
  try {
    const availability = await dbManager.findById('availabilities', availabilityId);

    if (!availability) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Availability not found');
    }

    // Notify about the deleted availability
    await realtimeService.notifyAvailabilityChange(availability);

    await dbManager.delete('availabilities', availabilityId);

    return availability;
  } catch (error) {
    logger.error('Error in deleteAvailability service:', error);
    throw error;
  }
};

/**
 * Get all availabilities
 * @param {Object} filter - Filter object
 * @returns {Promise<Array>}
 */
const getAllAvailabilities = async (filter = {}) => {
  try {
    const availabilities = await dbManager.findMany('availabilities', filter);
    return availabilities;
  } catch (error) {
    logger.error('Error in getAllAvailabilities:', error);
    throw error;
  }
};

/**
 * Get availability by ID
 * @param {string} availabilityId - Availability ID
 * @returns {Promise<Object>}
 */
const getAvailabilityById = async (availabilityId) => {
  try {
    const availability = await dbManager.findById('availabilities', availabilityId);
    return availability;
  } catch (error) {
    logger.error('Error in getAvailabilityById:', error);
    throw error;
  }
};

/**
 * Get availabilities by doctor ID
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<Array>}
 */
const getAvailabilitiesByDoctor = async (doctorId) => {
  try {
    const availabilities = await dbManager.findMany('availabilities', { user_id: doctorId });
    return availabilities;
  } catch (error) {
    logger.error('Error in getAvailabilitiesByDoctor:', error);
    throw error;
  }
};

module.exports = {
  getAvailableSlots,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  getAvailabilitiesByDoctor
};
