const dbManager = require('../db/dbManager');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Database Health Check Service
 *
 * Provides health check functionality for the configured primary database
 */

class DbHealthCheckService {
  /**
   * Check primary database connection health
   * @returns {Promise<Object>} Health status of the primary database
   */
  static async checkPrimaryDatabaseHealth() {
    try {
      // Since we're using the dbManager, we just need to verify it's connected
      // The dbManager already handles the connection logic for both databases

      if (config.primaryDb === 'SUPABASE') {
        // For Supabase, try a simple query
        try {
          // Try a simple select query on a common table (users)
          // Using the dbManager's underlying Supabase client
          const supabaseAdapter = dbManager.getDbClient();
          if (!supabaseAdapter || !supabaseAdapter.supabase) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Supabase client not available or not initialized');
          }

          // The supabaseClient here is actually the SupabaseAdapter instance
          // We need to access the actual Supabase client via the supabase property
          const { data, error } = await supabaseAdapter.supabase.from('users').select('id').limit(1);

          if (error && error.message !== 'Relation "users" does not exist.') {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Supabase health check failed: ${error.message}`);
          }

          return {
            status: 'healthy',
            database: 'Supabase',
            message: 'Supabase connection is healthy',
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          logger.error('Supabase health check failed:', error);
          return {
            status: 'error',
            database: 'Supabase',
            message: error.message,
            timestamp: new Date().toISOString()
          };
        }
      } else {
        // Handle other database types if needed
        return {
          status: 'unknown',
          database: config.primaryDb,
          message: 'Database type not supported for health check',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'error',
        database: config.primaryDb,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check all configured databases health
   * @returns {Promise<Object>} Combined health status of all databases
   */
  static async checkAllDatabasesHealth() {
    try {
      // Check primary database health
      const primaryDbHealth = await this.checkPrimaryDatabaseHealth();

      return {
        status: primaryDbHealth.status === 'healthy' ? 'healthy' : 'issues',
        primary: primaryDbHealth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error checking all databases health:', error);
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Database statistics
   */
  static async getDatabaseStats() {
    try {
      if (config.primaryDb === 'SUPABASE') {
        // Get the Supabase client
        const supabaseAdapter = dbManager.getDbClient();
        if (!supabaseAdapter || !supabaseAdapter.supabase) {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Supabase client not available or not initialized');
        }

        // Try to get some basic stats
        const stats = {
          users: 0,
          appointments: 0,
          prescriptions: 0
        };

        try {
          const { count: userCount, error: userError } = await supabaseAdapter.supabase.from('users').select('*', { count: 'exact', head: true });
          if (!userError) stats.users = userCount;
        } catch (e) {
          logger.warn('Could not get user count:', e.message);
        }

        try {
          const { count: appointmentCount, error: appointmentError } = await supabaseAdapter.supabase.from('appointments').select('*', { count: 'exact', head: true });
          if (!appointmentError) stats.appointments = appointmentCount;
        } catch (e) {
          logger.warn('Could not get appointment count:', e.message);
        }

        try {
          const { count: prescriptionCount, error: prescriptionError } = await supabaseAdapter.supabase.from('prescriptions').select('*', { count: 'exact', head: true });
          if (!prescriptionError) stats.prescriptions = prescriptionCount;
        } catch (e) {
          logger.warn('Could not get prescription count:', e.message);
        }

        return stats;
      } else {
        return {
          message: 'Database statistics not implemented for this database type'
        };
      }
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }
}

module.exports = DbHealthCheckService;
