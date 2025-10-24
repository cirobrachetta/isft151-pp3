import { UserRestController } from "../rest/UserRestController.js";

export const UserController = {
  async login(username, password) {
    const result = await UserRestController.login(username, password);
    console.log("Respuesta del backend /login:", result);

    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", username);

      if (result.role) {
        localStorage.setItem("role", result.role);
      }

      // ✅ guardar organización si viene en la respuesta
      if (result.organizationId !== undefined && result.organizationId !== null) {
        localStorage.setItem("organization", String(result.organizationId));
        console.log("✅ Organization guardado en localStorage:", result.organizationId);
      } else {
        console.warn("⚠️ Login sin organizationId. Revisar backend login response.");
      }
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

  async assignRole(userId, roleId, organizationId) {
    console.log("Asignando rol:", { userId, roleId, organizationId }); // 👈 Debug
    return UserRestController.assignRole(userId, roleId, organizationId);
  },

  async listRoles() {
    return UserRestController.listRoles();
  },
};