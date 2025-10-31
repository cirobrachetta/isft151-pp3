import { fetchWithAuth } from "../utils/httpClient.js";

const BASE = "/organizations";

export const OrganizationRestController = {
  list() {
    return fetchWithAuth(BASE);
  },

  create(name, contact) {
    return fetchWithAuth(BASE, {
      method: "POST",
      body: JSON.stringify({ name, contact }),
    });
  },

  get(id) {
    return fetchWithAuth(`${BASE}/${id}`);
  },

  updateBudget(id, delta) {
    return fetchWithAuth(`${BASE}/${id}/budget`, {
      method: "PUT",
      body: JSON.stringify({ delta }),
    });
  },
};