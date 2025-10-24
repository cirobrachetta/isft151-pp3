const API_BASE = "http://localhost:4000";
const API_URL = `${API_BASE}/users`;
const ORG_URL = `${API_BASE}/organizations`;
const ROLE_URL = `${API_BASE}/roles`;

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

export const UserRestController = {
  register(username, password, organizationId) {
    return fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, organizationId }),
    }).then(handleResponse);
  },

  login(username, password) {
    return fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    }).then(handleResponse);
  },

  logout(token) {
    return fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(handleResponse);
  },

  list() {
    const token = localStorage.getItem("token");
    return fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }).then(handleResponse);
  },

  listOrganizations() {
    const token = localStorage.getItem("token");
    return fetch(ORG_URL, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }).then(handleResponse);
  },

  listRoles() {
    const token = localStorage.getItem("token");
    return fetch(ROLE_URL, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }).then(handleResponse);
  },

  assignRole(userId, roleId, organizationId) {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}/${userId}/assignRole`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ roleId, organizationId })
    }).then(handleResponse);
  },
};