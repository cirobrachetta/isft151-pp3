import React, { useEffect, useState } from "react";
import { getUsers } from "../services/userApi";

export default function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function loadUsers() {
            const data = await getUsers();
            setUsers(data);
        }
        loadUsers();
    }, []);

    return (
        <ul>
            {users.map(u => (
                <li key={u.id}>{u.username}</li>
            ))}
        </ul>
    );
}
