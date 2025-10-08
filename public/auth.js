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

  isTokenExpired: function(token) {
    if (!token) return true;
    
    try {
      // Decode the JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with a small buffer)
      return payload.exp < currentTime + 30; // 30 seconds buffer
    } catch (e) {
      // If we can't decode the token, consider it expired
      return true;
    }
  },

  isSessionValid: function() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  },

  redirectToLogin: function() {
    window.location.href = '/login';
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
  // Only check authentication for pages under /v1/ but not for login page
  if (!window.location.pathname.endsWith('/login') &&
      window.location.pathname.startsWith('/v1/')) {
    
    // Check if user is authenticated and session is valid
    if (!window.AuthUtils.isAuthenticated() || 
        !window.AuthUtils.isSessionValid()) {
      window.AuthUtils.logout();
    }
  }
});
