const API_BASE = "http://localhost:4000";

function redirectToLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("organizationId");
  window.location.href = "/login";
}

/**
 * fetchWithAuth
 * Wrapper universal para todas las peticiones HTTP autenticadas.
 * Maneja cabeceras, errores y redirección automática en 401.
 */
export async function fetchWithAuth(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Redirección global si expira o falta el token
  if (res.status === 401) {
    redirectToLogin();
    throw new Error("Unauthorized");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // cuerpo vacío o no JSON
  }

  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || "Error desconocido";
    throw new Error(msg);
  }

  return data;
}