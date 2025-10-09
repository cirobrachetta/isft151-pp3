import { UserRestController } from "../rest/UserRestController.js";

export const UserController = {
  async login(username, password) {
    const result = await UserRestController.login(username, password);
    if (result.token) localStorage.setItem("token", result.token);
    return result;
  },

  async register(username, password) {
    return UserRestController.register(username, password);
  },

  async logout() {
    const token = localStorage.getItem("token");
    localStorage.removeItem("token");
    return UserRestController.logout(token);
  },

  async listUsers() {
    return UserRestController.list();
  },

  getToken() {
    return localStorage.getItem("token");
  },
};