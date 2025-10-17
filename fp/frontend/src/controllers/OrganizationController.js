import { OrganizationRestController } from "../rest/OrganizationRestController.js";

export const OrganizationController = {
  async listOrganizations() {
    return OrganizationRestController.list();
  },

  async createOrganization(name, contact) {
    return OrganizationRestController.create(name, contact);
  },
};