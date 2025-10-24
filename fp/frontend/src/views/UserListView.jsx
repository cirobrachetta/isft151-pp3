import React, { useEffect, useState } from "react";
import { UserController } from "../controllers/UserController";

export default function UserListView() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const organizationId = localStorage.getItem("organization");

  useEffect(() => {
    (async () => {
      try {
        const [userData, rolesData] = await Promise.all([
          UserController.listUsers(),
          UserController.listRoles()
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

  const handleRoleChange = async (userId, roleId) => {
    const storedOrg = localStorage.getItem("organization");
    const organizationId =
      storedOrg && storedOrg !== "null" ? storedOrg : null; // ✅ superadmin => null

    if (!roleId) {
      alert("Debe seleccionar un rol válido");
      return;
    }

    try {
      console.log("Asignando rol desde frontend:", { userId, roleId, organizationId });
      await UserController.assignRole(userId, roleId, organizationId);
      alert("Rol asignado correctamente");
    } catch (err) {
      console.error("Error asignando rol:", err);
      alert("Error asignando rol: " + err.message);
    }
  };

  return (
    <div className="usersContainer">
      <h2>Usuarios Registrados</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username}
            <select onChange={(e) => handleRoleChange(u.id, e.target.value)}>
              <option value="">Seleccionar rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}