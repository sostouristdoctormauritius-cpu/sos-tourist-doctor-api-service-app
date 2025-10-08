const supabaseAdapter = require('./adapters/supabaseAdapter');
const logger = require('../config/logger');
const metricsService = require('../services/metrics.service');

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
    const startTime = Date.now();
    let errorOccurred = false;

    try {
      this._checkClient();
      logger.info(`Attempting to create record in ${table}`, { data });
      const { data: result, error } = await this.supabaseAdapter.create(table, data);
      if (error) {
        logger.error(`Error creating record in ${table}:`, { error, data });
        errorOccurred = true;
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
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  async findById(table, id, populate = []) {
    const startTime = Date.now();
    let errorOccurred = false;

    try {
      this._checkClient();
      const result = await this.supabaseAdapter.findById(table, id, populate);
      return result;
    } catch (error) {
      logger.error(`Error finding record by ID ${id} in ${table}:`, error);
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  async findMany(table, query, populate = []) {
    const startTime = Date.now();
    let errorOccurred = false;

    try {
      this._checkClient();
      const result = await this.supabaseAdapter.findMany(table, query, populate);
      return result;
    } catch (error) {
      logger.error(`Error finding records in ${table}:`, error);
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  async findOne(table, query, populate = []) {
    const startTime = Date.now();
    let errorOccurred = false;

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
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  async update(table, id, data) {
    const startTime = Date.now();
    let errorOccurred = false;

    try {
      this._checkClient();
      const result = await this.supabaseAdapter.update(table, id, data);
      return result;
    } catch (error) {
      logger.error(`Error updating record in ${table} with ID ${id}:`, error);
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  async delete(table, id) {
    const startTime = Date.now();
    let errorOccurred = false;

    try {
      this._checkClient();
      const result = await this.supabaseAdapter.delete(table, id);
      return result;
    } catch (error) {
      logger.error(`Error deleting record in ${table} with ID ${id}:`, error);
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  async paginate(table, filter, options) {
    const startTime = Date.now();
    let errorOccurred = false;

    try {
      this._checkClient();
      logger.info('dbManager.paginate called with:', { table, filter, options });
      const result = await this.supabaseAdapter.paginate(table, filter, options);
      logger.info('dbManager.paginate completed successfully');
      return result;
    } catch (error) {
      logger.error('Error in dbManager.paginate:', error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      errorOccurred = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metricsService.trackDatabaseQuery(duration, errorOccurred);
    }
  }

  getDbClient() {
    return this.supabaseAdapter;
  }
}

module.exports = new DbManager();