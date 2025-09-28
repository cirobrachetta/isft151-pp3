import React, { useState } from "react";
import { loginUser } from "../services/userApi";

export default function LoginForm({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await loginUser(username, password);
        if (result.token) {
            onLogin(result.token);
        } else {
            alert("Login failed");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}
