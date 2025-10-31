import { fetchWithAuth } from "../utils/httpClient.js";

const BASE = "/users";
const ORG = "/organizations";
const ROLE = "/roles";

export const UserRestController = {
  register(username, password, organizationId) {
    return fetchWithAuth(`${BASE}/register`, {
      method: "POST",
      body: JSON.stringify({ username, password, organizationId }),
    });
  },

  login(username, password) {
    return fetchWithAuth(`${BASE}/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  logout(token) {
    return fetchWithAuth(`${BASE}/logout`, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  list() {
    return fetchWithAuth(BASE);
  },

  listOrganizations() {
    return fetchWithAuth(ORG);
  },

  listRoles() {
    return fetchWithAuth(ROLE);
  },

  assignRole(userId, roleId, organizationId) {
    return fetchWithAuth(`${BASE}/${userId}/assignRole`, {
      method: "POST",
      body: JSON.stringify({ roleId, organizationId }),
    });
  },
};