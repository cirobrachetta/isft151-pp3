import { UserRestController } from "../rest/UserRestController.js";

export const UserController = {
  async login(username, password) {
    const result = await UserRestController.login(username, password);
    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", username);
      if (result.role) localStorage.setItem("role", result.role);
      if (result.organization) localStorage.setItem("organization", result.organization);
    }
    return result;
  },

  async register(username, password, organizationId) {
    return UserRestController.register(username, password, organizationId);
  },

  async logout() {
    const token = localStorage.getItem("token");
    localStorage.clear();
    return UserRestController.logout(token);
  },

  async listUsers() {
    return UserRestController.list();
  },

  async listOrganizations() {
    return UserRestController.listOrganizations();
  },

  getToken() {
    return localStorage.getItem("token");
  },
};