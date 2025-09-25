// Abstracción de llamadas al backend
const API_URL = "http://localhost:4000/users";

export const registerUser = async (username, password) => {
  const response = await fetch("http://localhost:4000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json(); // lee el mensaje de error
    throw new Error(errorData.error || "Unknown error");
  }

  return response.json();
};

export async function loginUser(username, password) {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}

export async function logoutUser(token) {
    const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });
    return res.json();
}

export async function getUsers() {
    const res = await fetch(`${API_URL}`);
    return res.json();
}
