import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routesConfig } from "./routes/routesConfig";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const isAuth = !!token;

  const handleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const routes = routesConfig(isAuth, handleLogin);

  return (
    <Router>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </Router>
  );
}