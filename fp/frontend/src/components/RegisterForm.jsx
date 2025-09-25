import React, { useState } from "react";
import { registerUser } from "../services/userApi";

// Formulario simple para registro
export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await registerUser(username, password);
            alert("User registered: " + result.username);
        } catch (err) {
            alert("Error registering user");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Register</button>
        </form>
    );
}
