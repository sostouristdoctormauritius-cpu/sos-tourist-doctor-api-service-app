const supabaseAdapter = require('./adapters/supabaseAdapter');
const logger = require('../config/logger');

/**
 * Database Manager - Handles database operations using Supabase
 */
class DbManager {
  constructor() {
    this.supabaseAdapter = supabaseAdapter;
  }

  async connect() {
    logger.info('✅ Using Supabase as PRIMARY database');
    await this.supabaseAdapter.connect();
  }

  async disconnect() {
    if (this.supabaseAdapter) {
      await this.supabaseAdapter.disconnect();
    }
  }

  // Check if Supabase client is properly initialized
  _checkClient() {
    if (!this.supabaseAdapter || !this.supabaseAdapter.supabase) {
      const error = new Error('Supabase client is not properly initialized');
      logger.error('Supabase client not initialized', {
        adapterExists: !!this.supabaseAdapter,
        clientExists: !!(this.supabaseAdapter && this.supabaseAdapter.supabase)
      });
      throw error;
    }
  }

  // Expose common database operations
  async create(table, data) {
    try {
      this._checkClient();
      logger.info(`Attempting to create record in ${table}`, { data });
      const { data: result, error } = await this.supabaseAdapter.create(table, data);
      if (error) {
        logger.error(`Error creating record in ${table}:`, { error, data });
        throw error;
      }
      logger.info(`Successfully created record in ${table}`, { result });
      return result;
    } catch (error) {
      logger.error(`Exception in dbManager.create for table ${table}:`, error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  }

  async findById(table, id, populate = []) {
    try {
      this._checkClient();
      return await this.supabaseAdapter.findById(table, id, populate);
    } catch (error) {
      logger.error(`Error finding record by ID ${id} in ${table}:`, error);
      throw error;
    }
  }

  async findMany(table, query, populate = []) {
    try {
      this._checkClient();
      return await this.supabaseAdapter.findMany(table, query, populate);
    } catch (error) {
      logger.error(`Error finding records in ${table}:`, error);
      throw error;
    }
  }

  async findOne(table, query, populate = []) {
    try {
      this._checkClient();
      logger.info('dbManager.findOne called with:', { table, query, populate });
      const result = await this.supabaseAdapter.findOne(table, query, populate);
      logger.info('dbManager.findOne completed successfully');
      return result;
    } catch (error) {
      logger.error('Error in dbManager.findOne:', error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  }

  async update(table, id, data) {
    try {
      this._checkClient();
      return await this.supabaseAdapter.update(table, id, data);
    } catch (error) {
      logger.error(`Error updating record ${id} in ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      this._checkClient();
      return await this.supabaseAdapter.delete(table, id);
    } catch (error) {
      logger.error(`Error deleting record ${id} in ${table}:`, error);
      throw error;
    }
  }

  async aggregate(table, pipeline) {
    try {
      this._checkClient();
      return await this.supabaseAdapter.aggregate(table, pipeline);
    } catch (error) {
      logger.error(`Error aggregating records in ${table}:`, error);
      throw error;
    }
  }

  async count(table, query = {}) {
    try {
      this._checkClient();
      // Use the Supabase adapter's count functionality for better performance
      const result = await this.supabaseAdapter.count(table, query);
      return result || 0;
    } catch (error) {
      logger.error(`Error counting records in ${table}:`, error);
      throw error;
    }
  }

  async isEmailTaken(email, excludeUserId) {
    try {
      this._checkClient();
      const query = { email };
      if (excludeUserId) {
        query.id = { neq: excludeUserId };
      }
      const user = await this.supabaseAdapter.findOne('users', query);
      return !!user;
    } catch (error) {
      logger.error(`Error checking if email ${email} is taken:`, error);
      throw error;
    }
  }

  async isPhoneTaken(phone) {
    try {
      this._checkClient();
      const user = await this.supabaseAdapter.findOne('users', { phone });
      return !!user;
    } catch (error) {
      logger.error(`Error checking if phone ${phone} is taken:`, error);
      throw error;
    }
  }

  async checkConflictingAppointment(doctorId, date, startTime, endTime) {
    try {
      this._checkClient();
      const conflicting = await this.supabaseAdapter.checkConflictingAppointment(doctorId, date, startTime, endTime);
      return conflicting;
    } catch (error) {
      logger.error('Error checking conflicting appointment:', error);
      throw error;
    }
  }

  async findAvailableDoctor(date, startTime, consultationType) {
    try {
      this._checkClient();
      const availableDoctor = await this.supabaseAdapter.findAvailableDoctor(date, startTime, consultationType);
      return availableDoctor;
    } catch (error) {
      logger.error('Error finding available doctor:', error);
      throw error;
    }
  }

  async paginate(table, query, options) {
    try {
      this._checkClient();
      return await this.supabaseAdapter.paginate(table, query, options);
    } catch (error) {
      logger.error(`Error paginating records in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time changes in a table
   * @param {string} table - The table name to subscribe to
   * @param {function} callback - The callback function to handle changes
   * @param {string} subscriptionName - Optional name for the subscription
   * @returns {object} The subscription channel
   */
  subscribeToTable(table, callback, subscriptionName) {
    try {
      this._checkClient();
      return this.supabaseAdapter.subscribeToTable(table, callback, subscriptionName);
    } catch (error) {
      logger.error(`Error subscribing to table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time changes in a table with a filter
   * @param {string} table - The table name to subscribe to
   * @param {string} filter - The filter to apply to the subscription
   * @param {function} callback - The callback function to handle changes
   * @param {string} subscriptionName - Optional name for the subscription
   * @returns {object} The subscription channel
   */
  subscribeToTableWithFilter(table, filter, callback, subscriptionName) {
    try {
      this._checkClient();
      return this.supabaseAdapter.subscribeToTableWithFilter(table, filter, callback, subscriptionName);
    } catch (error) {
      logger.error(`Error subscribing to table ${table} with filter ${filter}:`, error);
      throw error;
    }
  }

  // Method to get the Supabase client directly for special operations
  getDbClient() {
    this._checkClient();
    return this.supabaseAdapter.supabase;
  }
}

module.exports = new DbManager();
