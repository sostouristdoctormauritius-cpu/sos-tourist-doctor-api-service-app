const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../src/config/config');

// Configuration
const API_BASE_URL = `http://localhost:${config.port}/v1`;
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';

// Use the same JWT secret from the config
const jwtSecret = config.jwt.secret;

/**
 * Generate admin JWT token
 */
function generateAdminToken() {
  const payload = {
    sub: 'admin-user-id', // This matches the hardcoded admin user in passport.js
    role: 'admin',
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  };

  return jwt.sign(payload, jwtSecret);
}

/**
 * List all doctors using the admin endpoint
 */
async function listAllDoctors() {
  try {
    console.log('🔐 Generating admin token...');
    const token = generateAdminToken();

    console.log('📋 Fetching all doctors from database...');
    console.log(`🌐 API Endpoint: ${API_BASE_URL}/doctors/admin/all`);
    console.log(`🔑 Using admin token: ${token.substring(0, 50)}...`);

    // Make the API request
    const response = await axios.get(`${API_BASE_URL}/doctors/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('\n✅ Successfully retrieved doctors!');
    console.log(`📊 Total doctors found: ${response.data.totalResults || response.data.results?.length || 0}`);

    if (response.data.results && response.data.results.length > 0) {
      console.log('\n👨‍⚕️  Doctor Details:');
      console.log('─'.repeat(80));

      response.data.results.forEach((doctor, index) => {
        console.log(`${index + 1}. 🏥 ${doctor.name || 'Unnamed Doctor'}`);
        console.log(`   📧 Email: ${doctor.email}`);
        console.log(`   📱 Phone: ${doctor.phone || 'Not provided'}`);
        console.log(`   🏷️  Role: ${doctor.role}`);
        console.log(`   👁️  Listed: ${doctor.doctor_profile?.is_listed ? '✅ Yes' : '❌ No'}`);

        if (doctor.doctor_profile?.specialisation) {
          console.log(`   🩺 Specialization: ${doctor.doctor_profile.specialisation}`);
        }

        if (doctor.doctor_profile?.supportedLanguages) {
          console.log(`   🌐 Languages: ${doctor.doctor_profile.supportedLanguages.join(', ')}`);
        }

        console.log(`   🆔 Doctor ID: ${doctor.id}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No doctors found in the database.');
    }

    // Display pagination info if available
    if (response.data.totalPages) {
      console.log(`📄 Pagination: Page ${response.data.page || 1} of ${response.data.totalPages}`);
      console.log(`📊 Showing ${response.data.results?.length || 0} of ${response.data.totalResults} total doctors`);
    }

    return response.data;

  } catch (error) {
    console.error('\n❌ Error fetching doctors:');

    if (error.response) {
      // Server responded with error status
      console.error(`🔴 HTTP ${error.response.status}: ${error.response.statusText}`);
      console.error('📝 Response:', error.response.data);

      if (error.response.status === 401) {
        console.error('\n💡 Authentication failed. Please check:');
        console.error('   1. Admin user exists in the system');
        console.error('   2. JWT secret matches the server configuration');
        console.error('   3. Server is running and accessible');
      }

    } else if (error.code === 'ECONNREFUSED') {
      // Server not running
      console.error('🔴 Connection refused. Please ensure the server is running on port', config.port);
      console.error(`💡 Try running: npm run dev`);

    } else if (error.code === 'ENOTFOUND') {
      // Host not found
      console.error('🔴 Host not found. Please check the API_BASE_URL configuration');

    } else {
      // Other error
      console.error(`🔴 ${error.message}`);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    throw error;
  }
}

/**
 * List doctors with optional filters
 */
async function listDoctorsWithFilters(filters = {}) {
  try {
    const token = generateAdminToken();
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${API_BASE_URL}/doctors/admin/all?${queryParams}`
      : `${API_BASE_URL}/doctors/admin/all`;

    console.log(`🔍 Fetching doctors with filters: ${JSON.stringify(filters)}`);

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Found ${response.data.results?.length || 0} doctors matching filters`);
    return response.data;

  } catch (error) {
    console.error('❌ Error fetching doctors with filters:', error.message);
    throw error;
  }
}

/**
 * Get doctor statistics
 */
async function getDoctorStats() {
  try {
    const token = generateAdminToken();

    console.log('📊 Fetching doctor statistics...');

    const response = await axios.get(`${API_BASE_URL}/doctors/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📊 Doctor Statistics:');
    console.log('─'.repeat(40));
    console.log(`👥 Total Doctors: ${response.data.totalDoctors}`);
    console.log(`✅ Listed Doctors: ${response.data.listedDoctors}`);
    console.log(`❌ Unlisted Doctors: ${response.data.unlistedDoctors}`);

    if (response.data.specializations && Object.keys(response.data.specializations).length > 0) {
      console.log('\n🩺 Specializations:');
      Object.entries(response.data.specializations).forEach(([specialization, count]) => {
        console.log(`   ${specialization}: ${count} doctors`);
      });
    }

    return response.data;

  } catch (error) {
    console.error('❌ Error fetching doctor statistics:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🏥 SOS Tourist Doctor - List All Doctors Script');
  console.log('═'.repeat(50));
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('');

  try {
    // First get an overview with statistics
    await getDoctorStats();

    console.log('\n' + '='.repeat(50));

    // Then list all doctors
    const doctorsData = await listAllDoctors();

    console.log('\n✨ Script completed successfully!');
    return doctorsData;

  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  listAllDoctors,
  listDoctorsWithFilters,
  getDoctorStats,
  generateAdminToken
};

// If script is run directly, execute main function
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Execution failed:', error.message);
      process.exit(1);
    });
}
