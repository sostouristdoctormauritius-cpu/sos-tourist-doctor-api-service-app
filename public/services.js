// services.js - Centralized service layer for the dashboard

class ApiService {
  constructor() {
    this.baseURL = '/v1';
    // Initialize Supabase client if in browser environment
    if (typeof window !== 'undefined' && typeof supabase !== 'undefined') {
      // Get Supabase configuration from environment or secure location
      this.SUPABASE_URL = window.ENV?.SUPABASE_URL || 'http://localhost:54321';
      this.SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';

      if (this.SUPABASE_URL && this.SUPABASE_ANON_KEY) {
        this.supabase = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully');
      } else {
        console.warn('Supabase configuration not found. Please check your environment variables.');
        console.log('SUPABASE_URL:', this.SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY:', this.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      }
    }
  }

  // Get authentication token - now using AuthUtils
  getToken() {
    return AuthUtils.getToken();
  }

  // Check if user is authenticated - now using AuthUtils
  isAuthenticated() {
    return AuthUtils.isAuthenticated();
  }

  // Check if token is expired - now using AuthUtils
  isTokenExpired(token) {
    return AuthUtils.isTokenExpired(token);
  }

  // Check if session is valid - now using AuthUtils
  isSessionValid() {
    return AuthUtils.isSessionValid();
  }

  // Redirect to login page - now using AuthUtils
  redirectToLogin() {
    AuthUtils.redirectToLogin();
  }

  // Logout user - now using AuthUtils
  logout() {
    AuthUtils.logout();
  }

  // Make authenticated fetch request - now using AuthUtils
  async fetch(url, options = {}) {
    // Use AuthUtils.fetch which handles authentication automatically
    return AuthUtils.fetch(url, options);
  }

  // Public fetch (no authentication required)
  async publicFetch(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // Fetch clients data from REST API (since RLS blocks anon access)
  async getClients() {
    try {
      console.log('Fetching clients from REST API...');

      const response = await this.fetch(`${this.baseURL}/users`);
      const data = await response.json();

      // Transform data to match expected format
      const clients = (data.results || data.users || data).map(user => ({
        id: user.id || user._id || 'N/A',
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'patient',
        status: user.is_status || user.status || 'active',
        created_at: user.created_at || user.createdAt || new Date().toISOString()
      }));

      console.log('Clients data fetched from REST API:', clients);
      return clients;
    } catch (error) {
      console.error('Error fetching clients from REST API:', error);
      throw error;
    }
  }

  // Fetch clients data from REST API
  async getClientsFromAPI() {
    try {
      console.log('Fetching clients from REST API...');
      
      const response = await this.fetch(`${this.baseURL}/users`);
      const data = await response.json();
      
      // Transform data to match expected format
      const clients = (data.results || data.users || data).map(user => ({
        id: user.id || user._id || 'N/A',
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'patient',
        status: user.is_status || user.status || 'active',
        created_at: user.created_at || user.createdAt || new Date().toISOString()
      }));
      
      console.log('Clients data fetched from REST API:', clients);
      return clients;
    } catch (error) {
      console.error('Error fetching clients from REST API:', error);
      throw error;
    }
  }

  // Fetch doctors data from REST API (since RLS blocks anon access)
  async getDoctors(page = 1, limit = 10) {
    try {
      console.log('Fetching doctors from REST API...', { page, limit });

      const response = await this.fetch(`${this.baseURL}/doctors?page=${page}&limit=${limit}`);
      const data = await response.json();

      console.log('Doctors API response:', data);

      // Transform data to match expected format
      const doctors = (data.results || data.doctors || data).map(doctor => ({
        id: doctor.id || doctor._id || 'N/A',
        name: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'N/A',
        email: doctor.email || 'No Email',
        role: doctor.role || 'doctor',
        specialty: doctor.specialisation || doctor.specialty || 'General Practitioner',
        status: doctor.is_status || doctor.status || 'active',
        created_at: doctor.created_at || doctor.createdAt || new Date().toISOString(),
        updated_at: doctor.updated_at || doctor.updatedAt || new Date().toISOString(),
        rating: parseFloat(doctor.rating) || 0,
        rating_count: parseInt(doctor.rating_count) || 0,
        address: doctor.address || 'Not specified',
        working_hours: doctor.working_hours || 'Not specified',
        bio: doctor.bio || 'No biography available',
        experience: doctor.experience || 'Not specified',
        education: doctor.education || 'Not specified',
        languages: doctor.languages || ['English'],
        avatar: doctor.avatar || null,
        phone: doctor.phone || 'Not specified'
      }));

      console.log('Doctors data fetched from REST API:', doctors);
      return {
        doctors: doctors,
        pagination: {
          page: data.page || page,
          limit: data.limit || limit,
          totalPages: data.totalPages || Math.ceil((data.totalResults || doctors.length) / (data.limit || limit)),
          totalResults: data.totalResults || data.length || doctors.length
        }
      };
    } catch (error) {
      console.error('Error fetching doctors from REST API:', error);
      throw error;
    }
  }

  // Fetch doctors data from REST API
  async getDoctorsFromAPI(page = 1, limit = 10) {
    try {
      console.log('Fetching doctors from REST API...');
      
      const response = await this.fetch(`${this.baseURL}/doctors?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      // Transform data to match expected format
      const doctors = (data.results || data.doctors || data).map(doctor => ({
        id: doctor.id || doctor._id || 'N/A',
        name: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'N/A',
        email: doctor.email || 'No Email',
        role: doctor.role || 'doctor',
        specialty: doctor.specialisation || doctor.specialty || 'General Practitioner',
        status: doctor.is_status || doctor.status || 'active',
        created_at: doctor.created_at || doctor.createdAt || new Date().toISOString(),
        updated_at: doctor.updated_at || doctor.updatedAt || new Date().toISOString(),
        rating: parseFloat(doctor.rating) || 0,
        rating_count: parseInt(doctor.rating_count) || 0,
        address: doctor.address || 'Not specified',
        working_hours: doctor.working_hours || 'Not specified',
        bio: doctor.bio || 'No biography available',
        experience: doctor.experience || 'Not specified',
        education: doctor.education || 'Not specified',
        languages: doctor.languages || ['English'],
        avatar: doctor.avatar || null,
        phone: doctor.phone || 'Not specified'
      }));
      
      console.log('Doctors data fetched from REST API:', doctors);
      return {
        doctors: doctors,
        pagination: {
          page: data.page || 1,
          limit: data.limit || limit,
          totalPages: data.totalPages || 1,
          totalResults: data.totalResults || doctors.length
        }
      };
    } catch (error) {
      console.error('Error fetching doctors from REST API:', error);
      throw error;
    }
  }

  // Fetch patients data from REST API (users with role 'patient')
  async getPatients(page = 1, limit = 10) {
    try {
      console.log('Fetching patients from REST API...', { page, limit });

      const response = await this.fetch(`${this.baseURL}/patients?page=${page}&limit=${limit}`);
      const data = await response.json();

      console.log('Patients API response:', data);

      // Transform data to match expected format
      const patients = (data.results || data.users || data).map(user => ({
        id: user.id || user._id || 'N/A',
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'patient',
        status: user.is_status || user.status || 'active',
        created_at: user.created_at || user.createdAt || new Date().toISOString()
      }));

      console.log('Patients data fetched from REST API:', patients);
      return {
        patients: patients,
        pagination: {
          page: data.page || page,
          limit: data.limit || limit,
          totalPages: data.totalPages || Math.ceil((data.totalResults || patients.length) / (data.limit || limit)),
          totalResults: data.totalResults || data.length || patients.length
        }
      };
    } catch (error) {
      console.error('Error fetching patients from REST API:', error);
      throw error;
    }
  }

  // Fetch appointments data from Supabase
  async getAppointments() {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          user:users!appointments_user_id_fkey(name, email),
          doctor:users!appointments_doctor_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      // Transform data to match expected format
      const appointments = data.map(appointment => ({
        id: appointment.id,
        user: {
          name: appointment.user?.name,
          email: appointment.user?.email
        },
        doctor: {
          name: appointment.doctor?.name,
          email: appointment.doctor?.email
        },
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status,
        consultation_type: appointment.consultation_type,
        created_at: appointment.created_at
      }));

      return appointments;
    } catch (error) {
      console.error('Error fetching appointments from Supabase:', error);
      throw error;
    }
  }

  // Fetch dashboard data
  async getDashboardData() {
    const response = await this.fetch(`${this.baseURL}/dashboard`);
    return await response.json();
  }

  // Update client data in Supabase
  async updateClient(clientId, clientData) {
    try {
      console.log('Updating client in Supabase:', clientId, clientData);

      // Prepare data for update
      const updateData = {
        name: clientData.name,
        email: clientData.email,
        role: clientData.role,
        is_status: clientData.status,
        updated_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('Client updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating client in Supabase:', error);
      throw error;
    }
  }

  // Delete client from Supabase
  async deleteClient(clientId) {
    try {
      console.log('Deleting client from Supabase:', clientId);

      // First delete related records in other tables
      // Delete doctor profile if exists
      await this.supabase
        .from('doctor_profiles')
        .delete()
        .eq('user_id', clientId);

      // Delete user profiles if exists
      await this.supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', clientId);

      // Finally delete the user
      const { data, error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', clientId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('Client deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting client from Supabase:', error);
      throw error;
    }
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Utility to handle DOM updates
class UIUtils {
  static showLoader(element, show) {
    if (element) {
      element.style.display = show ? 'inline-block' : 'none';
    }
  }

  static toggleButtonDisabled(button, disabled) {
    if (button) {
      button.disabled = disabled;
    }
  }

  static showError(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }

  static hideError(element) {
    if (element) {
      element.style.display = 'none';
    }
  }
}

// Export instances and functions
const apiService = new ApiService();

export {
  apiService,
  formatDate,
  UIUtils
};