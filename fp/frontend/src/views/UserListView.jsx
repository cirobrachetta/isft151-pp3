import React, { useEffect, useState } from "react";
import { UserController } from "../controllers/UserController";
import "../../styles/UserListView.scss";

export default function UserListView() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await UserController.listUsers();
      setUsers(data);
    })();
  }, []);

  return (
    <div className="usersContainer">
      <h2>Usuarios Registrados</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.username}</li>
        ))}
      </ul>
    </div>
  );
}