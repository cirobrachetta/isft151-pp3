import LandingView from "../views/LandingPage";
import LoginView from "../views/LoginView";
import RegisterView from "../views/RegisterView";
import UserListView from "../views/UserListView";
import DashboardView from "../views/DashboardView";
import PrivateRoute from "../components/PrivateRoute";

export const routesConfig = (isAuth, handleLogin) => [
  { path: "/", element: <LandingView /> },
  { path: "/login", element: <LoginView onLogin={handleLogin} /> },
  { path: "/register", element: <RegisterView /> },
  {
    path: "/dashboard",
    element: <PrivateRoute isAuth={isAuth} element={<DashboardView />} />,
  },
  {
    path: "/users",
    element: <PrivateRoute isAuth={isAuth} element={<UserListView />} />,
  },
  { path: "*", element: <LandingView /> },
];