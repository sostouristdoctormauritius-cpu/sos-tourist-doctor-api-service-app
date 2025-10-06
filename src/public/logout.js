// Logout utility for admin dashboard
(function() {
  // Function to handle logout
  window.handleLogout = async function() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      // Call the logout API endpoint
      const response = await fetch('/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      // Clear tokens from localStorage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redirect to login page
      window.location.href = '/v1/login-admin';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/v1/login-admin';
    }
  };

  // Function to add logout button to the dashboard (fallback method)
  function addLogoutButton() {
    // Only add if there's no existing logout button
    if (document.querySelector('.logout-button') || document.querySelector('#admin-logout-btn')) {
      return;
    }

    // Try to find a suitable place to add the logout button
    const headerElement = document.querySelector('header') ||
                         document.querySelector('[class*="header"]') ||
                         document.querySelector('[class*="navbar"]') ||
                         document.querySelector('[class*="nav"]') ||
                         document.body;

    // Create logout button
    const logoutButton = document.createElement('button');
    logoutButton.id = 'admin-logout-btn';
    logoutButton.textContent = 'Logout';
    logoutButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      z-index: 10000;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    logoutButton.addEventListener('mouseover', function() {
      this.style.background = '#c82333';
    });

    logoutButton.addEventListener('mouseout', function() {
      this.style.background = '#dc3545';
    });

    logoutButton.addEventListener('click', window.handleLogout);

    // Add button to the page
    headerElement.appendChild(logoutButton);
  }

  // Initialize the logout button (fallback)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLogoutButton);
  } else {
    addLogoutButton();
  }

  // Also try after a delay to handle React apps
  setTimeout(addLogoutButton, 1000);
})();
