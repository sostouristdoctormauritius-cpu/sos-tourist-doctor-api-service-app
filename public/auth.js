
window.AuthUtils = {
  getToken: function() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      return accessToken;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated: function() {
    return this.getToken() !== null;
  },

  redirectToLogin: function() {
    window.location.href = '/v1/login';
  },

  logout: function() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.redirectToLogin();
  },

  fetch: function(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      this.redirectToLogin();
      return Promise.reject(new Error('No authentication token'));
    }

    // Add authorization header
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + token;

    return fetch(url, options);
  }
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!window.AuthUtils.isAuthenticated() &&
      !window.location.pathname.endsWith('/login') &&
      window.location.pathname.startsWith('/v1/')) {
    window.AuthUtils.redirectToLogin();
  }
});
