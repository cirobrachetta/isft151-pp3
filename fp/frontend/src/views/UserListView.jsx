import React, { useEffect, useState } from "react";
import { UserController } from "../controllers/UserController";
import "../../styles/UserListView.scss";
import BackButton from "../components/BackButton.jsx";

export default function UserListView() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // ========================= CARGA INICIAL =========================
  useEffect(() => {
    (async () => {
      try {
        const [userData, rolesData] = await Promise.all([
          UserController.listUsers(),
          UserController.listRoles(),
        ]);
        setUsers(userData || []);
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      } catch (err) {
        console.error("Error cargando usuarios o roles:", err.message);
        setUsers([]);
        setRoles([]);
      }
    })();
  }, []);

  // ========================= ASIGNAR ROL =========================
  const handleRoleChange = async (userId, roleId) => {
    if (!roleId) {
      alert("Debe seleccionar un rol válido");
      return;
    }

    const storedOrg = localStorage.getItem("organization");
    const organizationId = storedOrg && storedOrg !== "null" ? storedOrg : null;

    try {
      await UserController.assignRole(userId, roleId, organizationId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role_id: roleId } : u
        )
      );
      alert("Rol asignado correctamente");
    } catch (err) {
      console.error("Error asignando rol:", err);
      alert("Error asignando rol: " + err.message);
    }
  };

  // ========================= RENDER =========================
  return (
    <div className="usersContainer">
      <h1>Gestión de Usuarios</h1>
      <p className="subtitle">Administración de roles y permisos por usuario.</p>

      <table className="usersTable">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol actual</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="3" className="noData">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const currentRole =
                u.role_name || roles.find((r) => r.id === u.role_id)?.name;
              const isSuperadmin =
                u.username.toLowerCase() === "superadmin" ||
                (currentRole || "").toLowerCase().includes("admin");

              return (
                <tr key={u.id} className={isSuperadmin ? "superadminRow" : ""}>
                  <td>{u.username}</td>
                  <td>{currentRole || "Sin rol asignado"}</td>
                  <td>
                    {isSuperadmin ? (
                      <span className="locked">No modificable</span>
                    ) : (
                      <select
                        value={u.role_id || ""}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="">Seleccionar rol</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <BackButton label="← Volver al dashboard" to="/dashboard" />
    </div>
  );
}