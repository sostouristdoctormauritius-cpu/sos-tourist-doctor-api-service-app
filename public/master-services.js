// master-services.js - Master service layer for all SOS applications

// Base API service class
class BaseApiService {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // GET request
  async get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  // POST request
  async post(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

// Authentication service
class AuthService {
  constructor() {
    this.tokenKey = 'accessToken';
    this.refreshTokenKey = 'refreshToken';
  }

  // Get authentication token
  getToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (e) {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.getToken() !== null;
  }

  // Save tokens
  saveTokens(accessToken, refreshToken) {
    try {
      localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    } catch (e) {
      console.error('Error saving tokens:', e);
    }
  }

  // Clear tokens
  clearTokens() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    } catch (e) {
      console.error('Error clearing tokens:', e);
    }
  }

  // Redirect to login
  redirectToLogin() {
    window.location.href = '/login';
  }

  // Logout
  logout() {
    this.clearTokens();
    this.redirectToLogin();
  }
}

// UI utilities
class UIUtils {
  // Show/hide loader
  static showLoader(element, show = true) {
    if (element) {
      element.style.display = show ? 'inline-block' : 'none';
    }
  }

  // Toggle button disabled state
  static toggleButtonDisabled(button, disabled = true) {
    if (button) {
      button.disabled = disabled;
    }
  }

  // Show error message
  static showError(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }

  // Hide error message
  static hideError(element) {
    if (element) {
      element.style.display = 'none';
    }
  }

  // Format date
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}

// Form utilities
class FormUtils {
  // Serialize form data to object
  static serializeForm(form) {
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  // Validate required fields
  static validateRequiredFields(form, requiredFields) {
    const errors = [];

    requiredFields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input || !input.value.trim()) {
        errors.push(field);
      }
    });

    return errors;
  }
}

// HTTP status codes
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Export all services
const apiService = new BaseApiService('/v1');
const authService = new AuthService();

export {
  BaseApiService,
  AuthService,
  UIUtils,
  FormUtils,
  HttpStatus,
  apiService,
  authService
};
