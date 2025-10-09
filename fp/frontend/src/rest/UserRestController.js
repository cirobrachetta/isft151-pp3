const API_URL = "/users";

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
  register(username, password) {
    return fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
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
    return fetch(API_URL).then(handleResponse);
  },
};