/**
 * Service API untuk komunikasi antara React Frontend dan PHP REST API Backend (XAMPP MySQL)
 * Meliputi Autentikasi User, Manajemen Workspace, dan Operasi CRUD Task
 */

const API_BASE = '/api';
const FALLBACK_BASE = 'http://localhost/api';

async function makeRequest(apiPath, options = {}) {
  let url = `${API_BASE}${apiPath}`;

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    let response;
    try {
      response = await fetch(url, config);
    } catch {
      // Fallback ke direct XAMPP URL jika proxy tidak aktif
      url = `${FALLBACK_BASE}${apiPath}`;
      response = await fetch(url, config);
    }

    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Response bukan JSON yang valid dari server: ${text.slice(0, 100)}`);
    }

    if (!response.ok) {
      const errorMsg = result.message || `Request gagal dengan status HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Gagal menghubungi server backend. Pastikan Apache & MySQL di XAMPP sudah berjalan.'
      );
    }
    throw error;
  }
}

export const taskApi = {
  // ===============================
  // 1. AUTENTIKASI (LOGIN & REGISTER)
  // ===============================
  async login({ email, password }) {
    const res = await makeRequest('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.data;
  },

  async register({ name, email, password }) {
    const res = await makeRequest('/auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return res.data;
  },

  async getProfile(userId) {
    const res = await makeRequest(`/auth.php?action=me&user_id=${userId}`);
    return res.data;
  },

  // ===============================
  // 2. MANAJEMEN WORKSPACE
  // ===============================
  async getUserWorkspaces(userId) {
    const res = await makeRequest(`/workspaces.php?user_id=${userId}`);
    return res.data || [];
  },

  async getWorkspaceDetail(workspaceId) {
    const res = await makeRequest(`/workspaces.php?id=${workspaceId}`);
    return res.data;
  },

  async createWorkspace({ name, description, userId }) {
    const res = await makeRequest('/workspaces.php?action=create', {
      method: 'POST',
      body: JSON.stringify({ name, description, user_id: userId }),
    });
    return res.data;
  },

  async joinWorkspace({ joinCode, userId }) {
    const res = await makeRequest('/workspaces.php?action=join', {
      method: 'POST',
      body: JSON.stringify({ join_code: joinCode, user_id: userId }),
    });
    return res.data;
  },

  async deleteWorkspace(workspaceId, userId) {
    const res = await makeRequest(`/workspaces.php?id=${workspaceId}&user_id=${userId}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // ===============================
  // 3. OPERASI CRUD TASK
  // ===============================
  async getTasks(workspaceId = null) {
    const query = workspaceId ? `?workspace_id=${workspaceId}` : '';
    const res = await makeRequest(`/tasks.php${query}`);
    return res.data || [];
  },

  async createTask({ title, description, status = 'todo', workspaceId = null, userId = null }) {
    const res = await makeRequest('/tasks.php', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        status,
        workspace_id: workspaceId,
        user_id: userId,
      }),
    });
    return res.data;
  },

  async updateStatus(id, status) {
    const res = await makeRequest(`/tasks.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
    return res.data;
  },

  async updateTask(id, { title, description, status }) {
    const res = await makeRequest(`/tasks.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, title, description, status }),
    });
    return res.data;
  },

  async deleteTask(id) {
    const res = await makeRequest(`/tasks.php?id=${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
