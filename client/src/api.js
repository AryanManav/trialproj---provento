const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('codemaster_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  async register(email, password, name) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  // Projects
  async getProjects() {
    return request('/projects');
  },

  async createProject(name, description) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  async getProject(id) {
    return request(`/projects/${id}`);
  },

  async updateProject(id, data) {
    return request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id) {
    return request(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Files
  async createFile(projectId, name, content = '') {
    return request(`/projects/${projectId}/files`, {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    });
  },

  async updateFile(id, data) {
    return request(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteFile(id) {
    return request(`/files/${id}`, {
      method: 'DELETE',
    });
  },

  // Execution
  async executeCode(code, language = 'javascript') {
    return request('/execute', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  },
};
