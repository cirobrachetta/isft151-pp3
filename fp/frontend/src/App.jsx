import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserList from "./components/UserList";

export default function App() {
    const [token, setToken] = useState(null);

    const handleLogin = (t) => {
        setToken(t);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                    path="/users"
                    element={token ? <UserList /> : <Navigate to="/login" replace />}
                />
                {/* Ruta catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}