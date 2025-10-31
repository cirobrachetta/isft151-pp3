const API_BASE = "http://localhost:4000";
const API_URL = `${API_BASE}/products`;

async function handleResponse(res) {
  if (!res.ok) {
    let msg = "Unknown error";
    try {
      const err = await res.json();
      msg = err.error || msg;
    } catch {
      msg = res.statusText || msg;
    }
    throw new Error(msg);
  }
  return res.json();
}

export const ProductRestController = {
  list() {
    const token = localStorage.getItem("token");
    return fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse);
  },

  getById(id) {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse);
  },

  create(data) {
    const token = localStorage.getItem("token");
    return fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  update(id, data) {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  deactivate(id, active) {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: active ? 0 : 1 }),
    }).then(handleResponse);
  },
};