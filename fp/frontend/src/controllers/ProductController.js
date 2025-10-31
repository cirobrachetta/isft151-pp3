import { ProductRestController } from "../rest/ProductRestController.js";

export const ProductController = {
  async list() {
    return ProductRestController.list();
  },

  async create(form) {
    const organizationId = Number(localStorage.getItem("organizationId"));
    return ProductRestController.create({
      ...form,
      organizationId: organizationId || null,
    });
  },

  async update(id, form) {
    return ProductRestController.update(id, form);
  },

  async deactivate(id, active) {
    return ProductRestController.deactivate(id, active);
  },
};