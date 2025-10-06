// Admin Navigation Enhancement Script
(function() {
  // Function to add doctor management link
  function addDoctorManagementLink() {
    // Try multiple selectors to find the navigation
    const navSelectors = [
      '.sidebar-menu',
      '.nav-links',
      '[class*="sidebar"] [class*="menu"]',
      '[class*="nav"] [class*="menu"]',
      'nav ul',
      '.sidebar',
      'nav'
    ];

    let navElement = null;
    for (const selector of navSelectors) {
      navElement = document.querySelector(selector);
      if (navElement) break;
    }

    if (navElement) {
      // Check if doctor management link already exists
      if (!document.querySelector('[href="/v1/doctors/management"]')) {
        // Create the doctor management link
        const doctorLink = document.createElement('a');
        doctorLink.href = '/v1/doctors/management';
        doctorLink.textContent = 'Doctor Management';
        doctorLink.className = 'nav-link';
        doctorLink.style.cssText = `
          display: block;
          padding: 10px 15px;
          text-decoration: none;
          color: #333;
          transition: background-color 0.2s;
        `;

        // Add hover effect
        doctorLink.addEventListener('mouseenter', function() {
          this.style.backgroundColor = '#f8f9fa';
        });

        doctorLink.addEventListener('mouseleave', function() {
          this.style.backgroundColor = '';
        });

        // Create a list item if the navigation uses list items
        const listItem = document.createElement('li');
        listItem.appendChild(doctorLink);
        listItem.style.cssText = 'list-style: none;';

        // Try to find a suitable place to insert the link
        navElement.appendChild(listItem);
      }
    }
  }

  // Function to add logout button
  function addLogoutButton() {
    // Check if logout button already exists
    if (!document.querySelector('.logout-button') && !document.querySelector('#admin-logout-btn')) {
      // Try to find header or a suitable place for logout button
      const headerSelectors = [
        '.header',
        '[class*="header"]',
        '[class*="navbar"]',
        'header',
        '.top-nav',
        '.app-bar'
      ];

      let headerElement = null;
      for (const selector of headerSelectors) {
        headerElement = document.querySelector(selector);
        if (headerElement) break;
      }

      // If no header found, use body
      if (!headerElement) {
        headerElement = document.body;
      }

      // Create logout button
      const logoutButton = document.createElement('a');
      logoutButton.href = '#';
      logoutButton.textContent = 'Logout';
      logoutButton.className = 'logout-button';
      logoutButton.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        padding: 8px 16px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 10000;
        text-decoration: none;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
      `;

      // Add hover effect
      logoutButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#c82333';
      });

      logoutButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#dc3545';
      });

      // Add click event to trigger logout
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        // Call the logout function if it exists
        if (typeof handleLogout === 'function') {
          handleLogout();
        } else if (typeof logout === 'function') {
          logout();
        } else {
          // Fallback: redirect to logout endpoint
          window.location.href = '/v1/auth/logout';
        }
      });

      headerElement.appendChild(logoutButton);
    }
  }

  // Function to initialize everything
  function initialize() {
    // Add styles to head
    if (!document.querySelector('#admin-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'admin-nav-styles';
      style.textContent = `
        @media (max-width: 768px) {
          .logout-button {
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            font-size: 14px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Add navigation elements
    addDoctorManagementLink();
    addLogoutButton();
  }

  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM is already loaded
    initialize();
  }

  // Also try to run after a short delay to handle React rendering
  setTimeout(initialize, 1000);

  // For React apps, also try to run periodically to handle re-renders
  setInterval(() => {
    addDoctorManagementLink();
    addLogoutButton();
  }, 3000);
})();
