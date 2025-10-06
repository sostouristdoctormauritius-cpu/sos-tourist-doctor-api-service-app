// Doctor Management Dashboard Component
class DoctorManagement {
  constructor() {
    this.container = null;
    this.doctors = [];
    this.currentPage = 1;
    this.limit = 10;
    this.totalPages = 1;
    this.init();
  }

  init() {
    // Wait for the DOM to be loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  async render() {
    // Create the container for doctor management
    this.container = document.createElement('div');
    this.container.id = 'doctor-management';
    this.container.innerHTML = `
      <div class="doctor-management-container">
        <h2>Doctor Management</h2>
        <div class="doctor-actions">
          <button id="add-doctor-btn" class="btn btn-primary">Add New Doctor</button>
        </div>
        <div class="doctor-filters">
          <input type="text" id="search-doctors" placeholder="Search doctors..." />
          <select id="specialization-filter">
            <option value="">All Specializations</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Pediatrician">Pediatrician</option>
          </select>
        </div>
        <div class="doctor-list-container">
          <table class="doctor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="doctor-table-body">
              <tr>
                <td colspan="5" class="loading">Loading doctors...</td>
              </tr>
            </tbody>
          </table>
          <div class="pagination-controls">
            <button id="prev-page" disabled>Previous</button>
            <span id="page-info">Page 1 of 1</span>
            <button id="next-page" disabled>Next</button>
          </div>
        </div>
      </div>
    `;

    // Add to the dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.appendChild(this.container);
      this.bindEvents();
      this.loadDoctors();
    }
  }

  bindEvents() {
    // Add doctor button
    const addDoctorBtn = document.getElementById('add-doctor-btn');
    if (addDoctorBtn) {
      addDoctorBtn.addEventListener('click', () => this.showAddDoctorForm());
    }

    // Search input
    const searchInput = document.getElementById('search-doctors');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Specialization filter
    const specializationFilter = document.getElementById('specialization-filter');
    if (specializationFilter) {
      specializationFilter.addEventListener('change', (e) => this.handleFilter(e.target.value));
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousPage());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextPage());
    }
  }

  async loadDoctors(page = 1) {
    try {
      const response = await fetch(`/v1/doctors?page=${page}&limit=${this.limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load doctors');
      }

      const data = await response.json();
      this.doctors = data.results;
      this.currentPage = data.page;
      this.totalPages = data.totalPages;

      this.renderDoctors();
      this.updatePagination();
    } catch (error) {
      console.error('Error loading doctors:', error);
      this.showError('Failed to load doctors');
    }
  }

  renderDoctors() {
    const tableBody = document.getElementById('doctor-table-body');
    if (!tableBody) return;

    if (this.doctors.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No doctors found</td></tr>';
      return;
    }

    tableBody.innerHTML = this.doctors.map(doctor => `
      <tr data-doctor-id="${doctor.id}">
        <td>${doctor.name}</td>
        <td>${doctor.email}</td>
        <td>${doctor.doctorProfile?.specialisation || 'Not specified'}</td>
        <td>${doctor.isArchived ? 'Archived' : 'Active'}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit-doctor" data-id="${doctor.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-doctor" data-id="${doctor.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    // Bind edit and delete events
    document.querySelectorAll('.edit-doctor').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.editDoctor(id);
      });
    });

    document.querySelectorAll('.delete-doctor').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.deleteDoctor(id);
      });
    });
  }

  updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (pageInfo) {
      pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }

    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= this.totalPages;
    }
  }

  async previousPage() {
    if (this.currentPage > 1) {
      await this.loadDoctors(this.currentPage - 1);
    }
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      await this.loadDoctors(this.currentPage + 1);
    }
  }

  handleSearch(query) {
    // Implement search functionality
    console.log('Search query:', query);
  }

  handleFilter(specialization) {
    // Implement filter functionality
    console.log('Filter by specialization:', specialization);
  }

  showAddDoctorForm() {
    // Create modal for adding doctor
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Add New Doctor</h2>
        <form id="add-doctor-form">
          <div class="form-group">
            <label for="doctor-name">Name:</label>
            <input type="text" id="doctor-name" required />
          </div>
          <div class="form-group">
            <label for="doctor-email">Email:</label>
            <input type="email" id="doctor-email" required />
          </div>
          <div class="form-group">
            <label for="doctor-password">Password:</label>
            <input type="password" id="doctor-password" required minlength="8" />
          </div>
          <div class="form-group">
            <label for="doctor-specialization">Specialization:</label>
            <input type="text" id="doctor-specialization" />
          </div>
          <div class="form-group">
            <label for="doctor-bio">Bio:</label>
            <textarea id="doctor-bio"></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="doctor-listed" /> Listed
            </label>
          </div>
          <button type="submit" class="btn btn-primary">Add Doctor</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => document.body.removeChild(modal));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    const form = document.getElementById('add-doctor-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddDoctor(e));
    }
  }

  async handleAddDoctor(e) {
    e.preventDefault();

    const name = document.getElementById('doctor-name').value;
    const email = document.getElementById('doctor-email').value;
    const password = document.getElementById('doctor-password').value;
    const specialization = document.getElementById('doctor-specialization').value;
    const bio = document.getElementById('doctor-bio').value;
    const isListed = document.getElementById('doctor-listed').checked;

    try {
      const response = await fetch('/v1/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          doctorProfile: {
            specialisation: specialization,
            bio: bio,
            isListed: isListed
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add doctor');
      }

      // Close modal and refresh list
      document.querySelector('.modal').remove();
      this.loadDoctors();
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('Failed to add doctor');
    }
  }

  editDoctor(id) {
    // Find the doctor
    const doctor = this.doctors.find(d => d.id === id);
    if (!doctor) return;

    // Create modal for editing doctor
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Edit Doctor</h2>
        <form id="edit-doctor-form">
          <input type="hidden" id="edit-doctor-id" value="${doctor.id}" />
          <div class="form-group">
            <label for="edit-doctor-name">Name:</label>
            <input type="text" id="edit-doctor-name" value="${doctor.name}" required />
          </div>
          <div class="form-group">
            <label for="edit-doctor-email">Email:</label>
            <input type="email" id="edit-doctor-email" value="${doctor.email}" required />
          </div>
          <div class="form-group">
            <label for="edit-doctor-specialization">Specialization:</label>
            <input type="text" id="edit-doctor-specialization" value="${doctor.doctorProfile?.specialisation || ''}" />
          </div>
          <div class="form-group">
            <label for="edit-doctor-bio">Bio:</label>
            <textarea id="edit-doctor-bio">${doctor.doctorProfile?.bio || ''}</textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="edit-doctor-listed" ${doctor.doctorProfile?.isListed ? 'checked' : ''} /> Listed
            </label>
          </div>
          <button type="submit" class="btn btn-primary">Update Doctor</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => document.body.removeChild(modal));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    const form = document.getElementById('edit-doctor-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleEditDoctor(e));
    }
  }

  async handleEditDoctor(e) {
    e.preventDefault();

    const id = document.getElementById('edit-doctor-id').value;
    const name = document.getElementById('edit-doctor-name').value;
    const email = document.getElementById('edit-doctor-email').value;
    const specialization = document.getElementById('edit-doctor-specialization').value;
    const bio = document.getElementById('edit-doctor-bio').value;
    const isListed = document.getElementById('edit-doctor-listed').checked;

    try {
      const response = await fetch(`/v1/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          doctorProfile: {
            specialisation: specialization,
            bio: bio,
            isListed: isListed
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update doctor');
      }

      // Close modal and refresh list
      document.querySelector('.modal').remove();
      this.loadDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Failed to update doctor');
    }
  }

  async deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      const response = await fetch(`/v1/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }

      this.loadDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to delete doctor');
    }
  }

  showError(message) {
    const tableBody = document.getElementById('doctor-table-body');
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" class="error">${message}</td></tr>`;
    }
  }
}

// Initialize the doctor management when the page loads
window.addEventListener('load', () => {
  // Only initialize if we're on the dashboard
  if (document.getElementById('dashboard')) {
    new DoctorManagement();
  }
});
