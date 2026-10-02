const API_BASE_URL = 'http://localhost/exasti-api/tasks.php';

export const taskService = {
  // Mengambil semua task dari database MySQL
  async getAll() {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data: HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  },

  // Menambahkan task baru ke database MySQL
  async create({ title, description, status = 'todo' }) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ title, description, status }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Gagal menambah task: HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Mengubah status atau data task di database MySQL
  async updateStatus(id, status) {
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Gagal memperbarui task: HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Menghapus task dari database MySQL
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Gagal menghapus task: HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },
};
