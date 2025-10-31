import { fetchWithAuth } from "../utils/httpClient.js";

const BASE = "/products";

export const ProductRestController = {
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
};