// services.js - Centralized service layer for the dashboard

class ApiService {
  constructor() {
    this.baseURL = '/v1';
    // Initialize Supabase client if in browser environment
    if (typeof window !== 'undefined' && typeof supabase !== 'undefined') {
      this.SUPABASE_URL = 'http://localhost:54321';
      this.SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
      this.supabase = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_SERVICE_KEY);
    }
  }

  // Get authentication token
  getToken() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      return accessToken;
    } catch (e) {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.getToken() !== null;
  }

  // Redirect to login page
  redirectToLogin() {
    window.location.href = '/v1/login';
  }

  // Logout user
  logout() {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (e) {
      console.error('Error clearing tokens:', e);
    }
    this.redirectToLogin();
  }

  // Make authenticated fetch request
  async fetch(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      this.redirectToLogin();
      throw new Error('No authentication token');
    }

    // Add authorization header
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + token;
    options.headers['Content-Type'] = 'application/json';

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
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

  // Fetch clients data from Supabase
  async getClients() {
    try {
      console.log('Fetching clients from Supabase...');

      // First check if Supabase client is initialized
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .or('role.eq.user,role.eq.patient');

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('Clients data fetched:', data);

      // Ensure we return data in the expected format
      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Transform data to ensure it has the expected properties
      const clients = data.map(user => ({
        id: user.id || user._id || 'N/A',
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'patient',
        status: user.is_status || user.status || 'active',
        created_at: user.created_at || user.createdAt || new Date().toISOString()
      }));

      console.log('Transformed clients data:', clients);
      return clients;
    } catch (error) {
      console.error('Error fetching clients from Supabase:', error);
      throw error;
    }
  }

  // Fetch doctors data from Supabase
  async getDoctors() {
    try {
      console.log('Fetching doctors from Supabase...');

      // First check if Supabase client is initialized
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // First, get all users with role 'doctor'
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('*')
        .eq('role', 'doctor')
        .order('created_at', { ascending: false });

      // Error handling for users query
      if (usersError) {
        console.error('Supabase users query error:', usersError);
        throw new Error(`Failed to fetch doctors: ${usersError.message}`);
      }

      // Return empty array if no users found
      if (!users || users.length === 0) {
        console.warn('No doctors found in users table');
        return [];
      }

      // Get user IDs for fetching profiles
      const userIds = users.map(user => user.id);

      // Then, get doctor profiles for these users
      const { data: profiles, error: profilesError } = await this.supabase
        .from('doctor_profiles')
        .select('*')
        .in('user_id', userIds);

      // Handle profile query error (not fatal, profiles might not exist)
      if (profilesError) {
        console.warn('Supabase profiles query error (continuing without profiles):', profilesError);
      }

      // Create a map of profiles by user_id for easy lookup
      const profileMap = {};
      if (profiles && Array.isArray(profiles)) {
        profiles.forEach(profile => {
          profileMap[profile.user_id] = profile;
        });
      }

      // Combine users with their profiles
      const doctors = users.map(user => {
        const profile = profileMap[user.id] || {};

        return {
          id: user.id || user._id || 'N/A',
          name: user.name ||
               `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
               'Unnamed Doctor',
          email: user.email || 'No Email',
          role: user.role || 'doctor',
          specialty: profile.specialisation || user.specialty || 'General Practitioner',
          status: user.is_status || user.status || 'active',
          created_at: user.created_at || user.createdAt || new Date().toISOString(),
          updated_at: user.updated_at || user.updatedAt || new Date().toISOString(),
          rating: parseFloat(profile.rating) || parseFloat(user.rating) || 0,
          rating_count: parseInt(profile.rating_count) || parseInt(user.rating_count) || 0,
          address: profile.address || 'Not specified',
          working_hours: profile.working_hours || 'Not specified',
          bio: profile.bio || 'No biography available',
          experience: profile.experience || 'Not specified',
          education: profile.education || 'Not specified',
          languages: profile.languages || ['English'],
          avatar: user.avatar || null,
          phone: user.phone || 'Not specified'
        };
      });

      console.log('Transformed doctors data:', doctors);
      return doctors;
    } catch (error) {
      console.error('Error fetching doctors from Supabase:', error);
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
