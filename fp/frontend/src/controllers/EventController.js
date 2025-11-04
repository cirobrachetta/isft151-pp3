import { EventRestController } from "../rest/EventRestController.js";
import { ProductController } from "./ProductController.js";

export const EventController = {
  async list() {
    return EventRestController.list();
  },

  async create({ name, date, ticketPrice }) {
    const organizationId = Number(localStorage.getItem("organizationId"));
    const payload = { name, date, ticketPrice, organizationId };
    return EventRestController.create(payload);
  },

  async update(id, { name, date, ticketPrice, active }) {
    return EventRestController.update(id, { name, date, ticketPrice, active });
  },

  async deactivate(id, active) {
    return EventRestController.deactivate(id, active);
  },

  async getById(id) {
    return EventRestController.getById(id);
  },

  async listProducts(eventId) {
    return EventRestController.listProducts(eventId);
  },

  async assignProduct(eventId, productId, qty) {
    return EventRestController.assignProduct(eventId, productId, qty);
  },

  async updateAssignedProduct(eventId, productId, qty) {
    return EventRestController.updateAssignedProduct(eventId, productId, qty);
  },

  async removeAssignedProduct(eventId, productId) {
    return EventRestController.removeAssignedProduct(eventId, productId);
  },

  async loadDetail(eventId) {
    const event = await EventRestController.getById(eventId);
    const products = (await ProductController.list()).filter(p => p.active);
    const reservations = await EventRestController.listProducts(eventId);
    return { event, products, reservations };
  },

  async printPDF(eventId) {
    return EventRestController.printPDF(eventId);
  },
};
