import { OrganizationRestController } from "../rest/OrganizationRestController.js";

export const OrganizationController = {
  async listOrganizations() {
    return OrganizationRestController.list();
  },

  async createOrganization(name, contact) {
    return OrganizationRestController.create(name, contact);
  },

  async getOrganization(id) {
    return OrganizationRestController.get(id);
  },

  async updateBudget(id, delta) {
    return OrganizationRestController.updateBudget(id, delta);
  }
};