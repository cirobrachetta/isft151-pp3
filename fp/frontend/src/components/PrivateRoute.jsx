import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ isAuth, element }) {
  return isAuth ? element : <Navigate to="/login" replace />;
}