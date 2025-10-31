import { fetchWithAuth } from "../utils/httpClient.js";

const BASE = "/events";

export const EventRestController = {
  list() {
    return fetchWithAuth(BASE);
  },

  getById(id) {
    return fetchWithAuth(`${BASE}/${id}`);
  },

  create(data) {
    return fetchWithAuth(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return fetchWithAuth(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deactivate(id, active) {
    return fetchWithAuth(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ active: active ? 0 : 1 }),
    });
  },

  listProducts(eventId) {
    return fetchWithAuth(`${BASE}/${eventId}/products`);
  },

  assignProduct(eventId, productId, qty) {
    return fetchWithAuth(`${BASE}/${eventId}/products`, {
      method: "POST",
      body: JSON.stringify({ productId, qty }),
    });
  },

  updateAssignedProduct(eventId, productId, qty) {
    return fetchWithAuth(`${BASE}/${eventId}/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ qty }),
    });
  },

  removeAssignedProduct(eventId, productId) {
    return fetchWithAuth(`${BASE}/${eventId}/products/${productId}`, {
      method: "DELETE",
    });
  },
};