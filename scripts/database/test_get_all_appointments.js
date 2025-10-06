const path = require('path');

// Set the config path so the dbManager can find it
process.env.NODE_CONFIG_DIR = path.join(__dirname, '../../src/config');

// Need to initialize config before requiring other modules
const config = require('../../src/config/config');

// Initialize dbManager
const dbManager = require('../../src/db/dbManager');

async function testGetAllAppointments() {
  try {
    console.log('Testing getAllAppointments with date filtering...');

    // Connect to database
    await dbManager.connect();
    console.log('Connected to database');

    // Import the appointment service after db connection
    const { getAllAppointments } = require('../../src/services/appointment.service');

    // Test 1: Get all appointments without date filter
    console.log('\n1. Getting all appointments (no date filter):');
    const allResult = await getAllAppointments({ limit: 10, page: 1 });
    console.log(`Total appointments: ${allResult.totalResults}`);
    allResult.results.forEach(app => {
      console.log(`  - ${app.id}: ${app.date} ${app.start_time}-${app.end_time} (${app.status})`);
    });

    // Test 2: Get appointments with date range filter
    console.log('\n2. Getting appointments with date range filter (2025-08-12 to 2025-08-13):');
    const filteredResult = await getAllAppointments({
      limit: 10,
      page: 1,
      startDate: '2025-08-12',
      endDate: '2025-08-13'
    });
    console.log(`Filtered appointments: ${filteredResult.totalResults}`);
    filteredResult.results.forEach(app => {
      console.log(`  - ${app.id}: ${app.date} ${app.start_time}-${app.end_time} (${app.status})`);
    });

    // Test 3: Get appointments with single date filter
    console.log('\n3. Getting appointments for single date (2025-08-12):');
    const singleResult = await getAllAppointments({
      limit: 10,
      page: 1,
      startDate: '2025-08-12',
      endDate: '2025-08-12'
    });
    console.log(`Single date appointments: ${singleResult.totalResults}`);
    singleResult.results.forEach(app => {
      console.log(`  - ${app.id}: ${app.date} ${app.start_time}-${app.end_time} (${app.status})`);
    });

    await dbManager.disconnect();
    console.log('\nTest completed successfully');

  } catch (error) {
    console.error('Error during test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testGetAllAppointments();
