import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ isAuth, element }) {
  const token = localStorage.getItem("token");

  if (!isAuth || !token) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return element;
}