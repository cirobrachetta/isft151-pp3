const API_BASE = "http://localhost:4000";
const API_URL = `${API_BASE}/organizations`;

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

export const OrganizationRestController = {
  list() {
    return fetch(API_URL).then(handleResponse);
  },

  create(name, contact) {
    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact }),
    }).then(handleResponse);
  },
  
  get(id) {
    return fetch(`${API_URL}/${id}`).then(handleResponse);
  },

  updateBudget(id, delta) {
    return fetch(`${API_URL}/${id}/budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    }).then(handleResponse);
  }
};