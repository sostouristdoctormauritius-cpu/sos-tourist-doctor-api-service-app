const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');
const logger = require('../../config/logger');

/**
 * Supabase Adapter - Primary database adapter
 * This is the main database adapter for the application
 */
class SupabaseAdapter {
  constructor() {
    // In test environment, use the global supabase client if available
    if (process.env.NODE_ENV === 'test' && global.supabase) {
      this.supabase = global.supabase;
      logger.info('Using global supabase client for testing');
    } else if (config.supabase.url && config.supabase.serviceRoleKey) {
      // Create new client with service role key for server-side operations
      try {
        this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            flowType: 'implicit' // Important for service role key usage
          },
          db: {
            schema: 'public'
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          },
          global: {
            headers: {
              'X-Client-Info': 'sos-tourist-doctor-api'
            }
          }
        });
        logger.info('Supabase client initialized with service role key');
      } catch (error) {
        logger.error('Failed to create Supabase client with service role key:', error);
        throw error;
      }
    } else {
      this.supabase = null;
      logger.warn('Supabase client not initialized - missing configuration');
    }
    this.subscriptions = new Map(); // Store active subscriptions
  }

  async connect() {
    if (this.supabase) {
      logger.info('Supabase client already initialized');
      return;
    }

    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new Error('Supabase URL and Key are not configured.');
    }

    // Log configuration details for debugging (without exposing the full key)
    logger.info('Supabase configuration:', {
      url: config.supabase.url,
      keyLength: config.supabase.serviceRoleKey.length,
      keyPrefix: config.supabase.serviceRoleKey.substring(0, 20)
    });

    try {
      // Properly configure the Supabase client for server-side usage with service role key
      this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: 'implicit' // Important for service role key usage
        },
        db: {
          schema: 'public'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        },
        global: {
          headers: {
            'X-Client-Info': 'sos-tourist-doctor-api'
          }
        }
      });
      logger.info('Connected to Supabase - PRIMARY DATABASE with real-time support');
    } catch (error) {
      logger.error('Failed to create Supabase client:', error);
      throw error;
    }
  }

  async disconnect() {
    // Unsubscribe from all channels before disconnecting
    for (const [channelName, subscription] of this.subscriptions) {
      await subscription.unsubscribe();
    }
    this.subscriptions.clear();


    // We can nullify the client to release resources.
    this.supabase = null;
    logger.info('Disconnected from Supabase (client nulled) - PRIMARY DATABASE');
  }

  /**
   * Unsubscribe from a specific channel
   * @param {string} channelName - The name of the channel to unsubscribe from
   */
  async unsubscribeFromChannel(channelName) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      await subscription.unsubscribe();
      this.subscriptions.delete(channelName);
      logger.info(`Unsubscribed from channel: ${channelName}`);
    } else {
      logger.warn(`Attempted to unsubscribe from non-existent channel: ${channelName}`);
    }
  }

  async create(table, data) {
    try {
      logger.info('SupabaseAdapter.create called', { table, data });
      const { data: result, error } = await this.supabase.from(table).insert([data]).select();
      if (error) {
        logger.error(`Supabase error creating record in ${table}:`, {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          data
        });
        throw error;
      }
      logger.info(`Successfully created record in ${table}`, { result: result[0] });
      return result[0];
    } catch (error) {
      logger.error(`Exception in SupabaseAdapter.create for table ${table}:`, {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async findById(table, id, populate = []) {
    const selectString = this._buildSelectString(populate);
    const { data, error } = await this.supabase.from(table).select(selectString).eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
    return data;
  }

  /**
   * Find multiple records
   * @param {string} table - Table name
   * @param {Object} query - Query object
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Array>}
   */
  /**
   * Find multiple records
   * @param {string} table - Table name
   * @param {Object} query - Query object
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Array>}
   */
  async findMany(table, query = {}, populate = []) {
    try {
      console.log('Building Supabase query with:', { table, query, populate });

      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      let queryBuilder = this.supabase.from(table).select(populate.join(','));

      // Apply filters
      for (const [key, value] of Object.entries(query)) {
        // Skip undefined values
        if (value === undefined) {
          console.log(`Skipping undefined value for key: ${key}`);
          continue;
        }

        const fieldName = this._mapFieldName(key);
        console.log(`Applying filter: ${fieldName} =`, value);

        if (key === '$or' && Array.isArray(value)) {
          // Handle OR conditions
          const orConditions = value.map(orClause => {
            const orKey = Object.keys(orClause)[0];
            const orValue = orClause[orKey];
            const mappedOrKey = this._mapFieldName(orKey);
            if (typeof orValue === 'object' && orValue.ilike) {
              return `${mappedOrKey}.ilike.${orValue.ilike}`;
            }
            return `${mappedOrKey}.eq.${orValue}`;
          }).join(',');
          console.log(`Applying OR condition: ${orConditions}`);
          queryBuilder = queryBuilder.or(orConditions);
        } else if (typeof value === 'object' && value !== null) {
          if (value.neq !== undefined) {
            queryBuilder = queryBuilder.neq(fieldName, value.neq);
          } else if (value.gte !== undefined) {
            queryBuilder = queryBuilder.gte(fieldName, value.gte);
          } else if (value.lte !== undefined) {
            queryBuilder = queryBuilder.lte(fieldName, value.lte);
          } else if (value.in !== undefined && Array.isArray(value.in)) {
            queryBuilder = queryBuilder.in(fieldName, value.in);
          } else if (value.like !== undefined) {
            queryBuilder = queryBuilder.like(fieldName, value.like);
          } else if (value.ilike !== undefined) {
            queryBuilder = queryBuilder.ilike(fieldName, value.ilike);
          } else {
            queryBuilder = queryBuilder.eq(fieldName, value);
          }
        } else {
          queryBuilder = queryBuilder.eq(fieldName, value);
        }
      }

      console.log(`Executing query on table: ${table}`);
      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Supabase error in findMany:', error);
        throw error;
      }

      console.log(`Query successful, found ${data.length} records`);
      return data;
    } catch (error) {
      console.error('Error in findMany:', error);
      throw error;
    }
  }

  /**
   * Find a single record
   * @param {string} table - Table name
   * @param {Object} query - Query object
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Object|null>}
   */
  async findOne(table, query = {}, populate = []) {
    try {
      console.log('Building Supabase findOne query with:', { table, query, populate });

      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      let queryBuilder = this.supabase.from(table).select(populate.join(',')).limit(1);

      // Apply filters
      for (const [key, value] of Object.entries(query)) {
        // Skip undefined values
        if (value === undefined) {
          console.log(`Skipping undefined value for key: ${key}`);
          continue;
        }

        const fieldName = this._mapFieldName(key);
        console.log(`Applying filter: ${fieldName} =`, value);

        if (key === '$or' && Array.isArray(value)) {
          // Handle OR conditions
          const orConditions = value.map(orClause => {
            const orKey = Object.keys(orClause)[0];
            const orValue = orClause[orKey];
            const mappedOrKey = this._mapFieldName(orKey);
            if (typeof orValue === 'object' && orValue.ilike) {
              return `${mappedOrKey}.ilike.${orValue.ilike}`;
            }
            return `${mappedOrKey}.eq.${orValue}`;
          }).join(',');
          console.log(`Applying OR condition: ${orConditions}`);
          queryBuilder = queryBuilder.or(orConditions);
        } else if (typeof value === 'object' && value !== null) {
          if (value.neq !== undefined) {
            queryBuilder = queryBuilder.neq(fieldName, value.neq);
          } else if (value.gte !== undefined) {
            queryBuilder = queryBuilder.gte(fieldName, value.gte);
          } else if (value.lte !== undefined) {
            queryBuilder = queryBuilder.lte(fieldName, value.lte);
          } else if (value.in !== undefined && Array.isArray(value.in)) {
            queryBuilder = queryBuilder.in(fieldName, value.in);
          } else if (value.like !== undefined) {
            queryBuilder = queryBuilder.like(fieldName, value.like);
          } else if (value.ilike !== undefined) {
            queryBuilder = queryBuilder.ilike(fieldName, value.ilike);
          } else {
            queryBuilder = queryBuilder.eq(fieldName, value);
          }
        } else {
          queryBuilder = queryBuilder.eq(fieldName, value);
        }
      }

      console.log(`Executing findOne query on table: ${table}`);
      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Supabase error in findOne:', error);
        throw error;
      }

      console.log(`findOne query successful, found ${data.length} records`);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  _buildSupabaseQuery(queryBuilder, query) {
    console.log('Building Supabase query with:', JSON.stringify(query, null, 2));

    for (const key in query) {
      if (Object.hasOwnProperty.call(query, key)) {
        // Skip undefined values
        if (query[key] === undefined) {
          console.log(`Skipping undefined value for key: ${key}`);
          continue;
        }

        // Handle JSON field queries (e.g., "doctor_profile->>is_listed")
        if (key.includes('->>')) {
          const [field, jsonKey] = key.split('->>');
          const value = query[key];
          console.log(`Applying JSON filter on ${field} with key ${jsonKey} and value ${value}`);
          // For boolean values, we need to convert them to strings
          const stringValue = typeof value === 'boolean' ? value.toString() : value;
          queryBuilder = queryBuilder.eq(`${field}->>${jsonKey}`, stringValue);
          continue;
        }

        // Handle dot notation for operators (e.g., "date.gte", "date.lte")
        if (key.includes('.')) {
          const [field, operator] = key.split('.');
          const value = query[key];
          const fieldName = this._mapFieldName(field);

          console.log(`Applying ${operator} filter on ${fieldName} with value ${value}`);

          switch (operator) {
            case 'gte':
              queryBuilder = queryBuilder.gte(fieldName, value);
              break;
            case 'lte':
              queryBuilder = queryBuilder.lte(fieldName, value);
              break;
            case 'gt':
              queryBuilder = queryBuilder.gt(fieldName, value);
              break;
            case 'lt':
              queryBuilder = queryBuilder.lt(fieldName, value);
              break;
            case 'neq':
              queryBuilder = queryBuilder.neq(fieldName, value);
              break;
            case 'like':
              queryBuilder = queryBuilder.like(fieldName, value);
              break;
            case 'ilike':
              queryBuilder = queryBuilder.ilike(fieldName, value);
              break;
            case 'in':
              if (Array.isArray(value)) {
                queryBuilder = queryBuilder.in(fieldName, value);
              }
              break;
            default:
              console.log(`Unknown operator ${operator} for field ${field}`);
          }
          continue;
        }

        const fieldName = this._mapFieldName(key);
        const value = query[key];

        console.log(`Processing key: ${key}, mapped to field: ${fieldName}, value:`, JSON.stringify(value, null, 2));

        if (key === '$or' && Array.isArray(value)) {
          const orConditions = value.map(orClause => {
            const orKey = Object.keys(orClause)[0];
            const orValue = orClause[orKey];
            const mappedOrKey = this._mapFieldName(orKey);
            if (typeof orValue === 'object' && orValue.ilike) {
              return `${mappedOrKey}.ilike.${orValue.ilike}`;
            }
            return `${mappedOrKey}.eq.${orValue}`;
          }).join(',');
          console.log(`Applying OR condition: ${orConditions}`);
          queryBuilder = queryBuilder.or(orConditions);
        } else if (typeof value === 'object' && value !== null) {
          if (value.neq !== undefined) {
            queryBuilder = queryBuilder.neq(fieldName, value.neq);
          } else if (value.gte !== undefined) {
            queryBuilder = queryBuilder.gte(fieldName, value.gte);
          } else if (value.lte !== undefined) {
            queryBuilder = queryBuilder.lte(fieldName, value.lte);
          } else if (value.in !== undefined && Array.isArray(value.in)) {
            queryBuilder = queryBuilder.in(fieldName, value.in);
          } else if (value.like !== undefined) {
            queryBuilder = queryBuilder.like(fieldName, value.like);
          } else if (value.ilike !== undefined) {
            queryBuilder = queryBuilder.ilike(fieldName, value.ilike);
          } else {
            queryBuilder = queryBuilder.eq(fieldName, value);
          }
        } else {
          queryBuilder = queryBuilder.eq(fieldName, value);
        }
      }
    }
    return queryBuilder;
  }

  _mapFieldName(fieldName) {
    // Map common camelCase field names to snake_case database column names
    const fieldMap = {
      'userId': 'user_id',
      'doctorId': 'doctor_id',
      'patientId': 'patient_id',
      'appointmentId': 'appointment_id',
      'isArchived': 'is_archived',
      'isEmailVerified': 'is_email_verified',
      'profilePicture': 'profile_picture',
      'userProfile': 'user_profile',
      'doctorProfile': 'doctor_profile',
      'streamUserId': 'stream_user_id',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'invitationToken': 'invitation_token',
      'invitationExpires': 'invitation_expires',
      'isInvitation': 'is_invitation',
      'deletionRequestToken': 'deletion_request_token',
      'deletionRequestExpires': 'deletion_request_expires',
      'archivedAt': 'archived_at',
      'isStatus': 'is_status',
      'startTime': 'start_time',
      'endTime': 'end_time',
      'startDate': 'start_date',
      'endDate': 'end_date',
      'isRecurring': 'is_recurring',
      'recurrenceEndDate': 'recurrence_end_date',
      'consultationTypes': 'consultation_types',
      'streamChannelId': 'stream_channel_id',
      'consultationType': 'consultation_type',
      'additionalNote': 'additional_note',
      'visitLocation': 'visit_location',
      'paymentLink': 'payment_link',
      'mipsIdOrder': 'mips_id_order',
      'idealTimes': 'ideal_times',
      'licenseNumber': 'license_number',
      'speciality': 'specialisation',
      'ratingCount': 'rating_count',
      'workingHours': 'working_hours',
      'isListed': 'is_listed',
      'supportedLanguages': 'supported_languages',
      'dueDate': 'due_date',
      'medicalHistories': 'medical_histories',
      'symptoms': 'symptoms',
      'bio': 'bio',
      'address': 'address',
      'nickname': 'nickname',
      'language': 'language',
      'dob': 'dob',
      'gender': 'gender',
      'phoneNumber': 'phone_number',
      'nationality': 'nationality',
      'specialisation': 'specialisation',
      'rating': 'rating',
      'configs': 'configs',
      'creator': 'creator',
      'key': 'key',
      'description': 'description',
      'note': 'note',
      'amount': 'amount',
      'currency': 'currency',
      'details': 'details',
      'medications': 'medications',
      'name': 'name',
      'dosage': 'dosage',
      'duration': 'duration',
      'strength': 'strength',
      'token': 'token',
      'type': 'type',
      'expires': 'expires',
      'blacklisted': 'blacklisted',
      'condition': 'condition',
      'diagnosisDate': 'diagnosis_date',
      'notes': 'notes',
      'table_name': 'table_name',
      'record_id': 'record_id',
      'old_record': 'old_record',
      'new_record': 'new_record',
      'changed_by': 'changed_by',
      'changed_at': 'changed_at'
    };

    return fieldMap[fieldName] || fieldName;
  }

  _buildSelectString(populate) {
    if (!populate || populate.length === 0) {
      return '*';
    }

    // For now, we'll just return * as Supabase handles joins differently
    // In a more advanced implementation, we would build proper select strings for joins
    return '*';
  }

  async update(table, id, data) {
    const { data: result, error } = await this.supabase.from(table).update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  }

  async delete(table, id) {
    const { data, error } = await this.supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  /**
   * Count records in a table
   * @param {string} table - Table name
   * @param {Object} query - Query object
   * @returns {Promise<number>}
   */
  async count(table, query = {}) {
    try {
      console.log(`Counting records in ${table} with query:`, query);

      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Create a query with count enabled
      let queryBuilder = this.supabase.from(table).select('*', { count: 'exact' });

      // Apply filters using the same logic as findMany
      queryBuilder = this._buildSupabaseQuery(queryBuilder, query);

      // Execute the query to get only the count
      const { count, error } = await queryBuilder;

      if (error) {
        console.error('Supabase error in count:', error);
        throw error;
      }

      console.log(`Count successful: ${count}`);
      return count || 0;
    } catch (error) {
      console.error('Error in count:', error);
      throw error;
    }
  }

  async aggregate(table, pipeline) {
    try {
      // Parse the pipeline to build Supabase query
      let query = this.supabase.from(table);

      // Handle different aggregation operations
      if (pipeline && Array.isArray(pipeline)) {
        for (const stage of pipeline) {
          const operation = Object.keys(stage)[0];
          const params = stage[operation];

          switch (operation) {
            case '$match':
            // Apply filters
              query = this._buildSupabaseQuery(query, params);
              break;

            case '$group':
            // Handle grouping and aggregation
              if (params._id && params._id !== null) {
              // Group by field
                const groupField = params._id;
                query = query.group(groupField);
              }

              // Handle aggregation functions
              {
                const aggFunctions = [];
                for (const [aggKey, aggValue] of Object.entries(params)) {
                  if (aggKey === '_id') continue;

                  const field = aggValue.$sum || aggValue.$avg || aggValue.$min || aggValue.$max || aggValue.$count;
                  if (field) {
                    if (aggValue.$sum) {
                      aggFunctions.push(`${field}.sum()`);
                    } else if (aggValue.$avg) {
                      aggFunctions.push(`${field}.avg()`);
                    } else if (aggValue.$min) {
                      aggFunctions.push(`${field}.min()`);
                    } else if (aggValue.$max) {
                      aggFunctions.push(`${field}.max()`);
                    } else if (aggValue.$count) {
                      aggFunctions.push('count');
                    }
                  }
                }

                if (aggFunctions.length > 0) {
                  query = query.select(aggFunctions.join(','));
                }
              }
              break;

            case '$sort':
            // Apply sorting
              for (const [field, direction] of Object.entries(params)) {
                const mappedField = this._mapFieldName(field);
                query = query.order(mappedField, { ascending: direction === 1 });
              }
              break;
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }
  }

  async paginate(table, filter, options = {}) {
    try {
      console.log('paginate called with:', { table, filter, options });

      const {
        sortBy = 'created_at:desc',
        limit = 10,
        page = 1
      } = options;

      const offset = (page - 1) * limit;

      let query = this.supabase.from(table).select('*', { count: 'exact' });

      // Apply filters
      query = this._buildSupabaseQuery(query, filter);

      // Apply sorting
      if (sortBy) {
        const [sortField, sortOrder] = sortBy.split(':');
        const mappedSortField = this._mapFieldName(sortField);
        const ascending = sortOrder === 'asc';
        query = query.order(mappedSortField, { ascending });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      console.log('Executing Supabase query for pagination');
      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      const result = {
        results: data || [],
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        totalResults: count || 0
      };

      console.log('paginate result:', result);
      return result;
    } catch (error) {
      console.error('Error in paginate function:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  }

  async checkConflictingAppointment(doctorId, date, startTime, endTime) {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('id')
      .eq(this._mapFieldName('doctorId'), doctorId)
      .eq(this._mapFieldName('date'), date)
      .neq(this._mapFieldName('status'), 'cancelled')
      .or(`and(${this._mapFieldName('startTime')}.lte.${startTime},${this._mapFieldName('endTime')}.gte.${endTime}),and(${this._mapFieldName('startTime')}.gte.${startTime},${this._mapFieldName('startTime')}.lt.${endTime}),and(${this._mapFieldName('endTime')}.gt.${startTime},${this._mapFieldName('endTime')}.lte.${endTime})`);

    if (error) throw error;
    return data.length > 0;
  }

  async findAvailableDoctor(date, startTime, consultationType) {
    const { data, error } = await this.supabase.rpc('get_available_doctor', {
      p_date: date,
      p_start_time: startTime,
      p_consultation_type: consultationType
    });
    if (error) throw error;
    return data;
  }

  async isEmailTaken(email, excludeUserId) {
    let query = this.supabase.from('users').select('id').eq('email', email);
    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.length > 0;
  }

  async isPhoneTaken(phone) {
    const { data, error } = await this.supabase.from('users').select('id').eq('phone', phone);
    if (error) throw error;
    return data.length > 0;
  }

  async decrement(table, id, field, amount) {
    const { data, error } = await this.supabase
      .from(table)
      .update({ [field]: this.supabase.rpc('decrement', { value: field, amount }) })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }

  getSupabaseClient() {
    return this.supabase;
  }

  getDbClient() {
    return this.supabase;
  }

  subscribeToTable(table, callback, subscriptionName) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const channelName = subscriptionName || `realtime:${table}`;

    // Create a new channel for the table
    const channel = this.supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    // Store the subscription
    this.subscriptions.set(channelName, channel);

    return channel;
  }

  subscribeToTableWithFilter(table, filter, callback, subscriptionName) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const channelName = subscriptionName || `realtime:${table}:filtered`;

    // Create a new channel for the table with filter
    const channel = this.supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    // Store the subscription
    this.subscriptions.set(channelName, channel);

    return channel;
  }

  async unsubscribeAll() {
    // Unsubscribe from all channels
    for (const [channelName, subscription] of this.subscriptions) {
      try {
        await subscription.unsubscribe();
        this.subscriptions.delete(channelName);
      } catch (error) {
        console.error(`Error unsubscribing from channel ${channelName}:`, error);
      }
    }
  }
}

module.exports = new SupabaseAdapter();
