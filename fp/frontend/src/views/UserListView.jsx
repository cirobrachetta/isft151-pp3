import React, { useEffect, useState } from "react";
import { UserController } from "../controllers/UserController";

export default function UserListView() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await UserController.listUsers();
      setUsers(data);
    })();
  }, []);

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.username}</li>
      ))}
    </ul>
  );
}