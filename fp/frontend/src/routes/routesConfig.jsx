import LandingView from "../views/LandingPage";
import LoginView from "../views/LoginView";
import RegisterView from "../views/RegisterView";
import UserListView from "../views/UserListView";
import DashboardView from "../views/DashboardView";
import PrivateRoute from "../components/PrivateRoute";
import InventoryView from "../views/InventoryView";
import FinanceView from "../views/FinanceView";
import EventsView from "../views/EventsView";
import OrganizationsView from "../views/OrganizationView";

export const routesConfig = (isAuth, handleLogin) => [
  { path: "/", element: <LandingView /> },
  { path: "/login", element: <LoginView onLogin={handleLogin} /> },
  { path: "/register", element: <RegisterView /> },

  // privadas
  { path: "/dashboard", element: <PrivateRoute isAuth={isAuth} element={<DashboardView />} /> },
  { path: "/users", element: <PrivateRoute isAuth={isAuth} element={<UserListView />} /> },
  { path: "/organizations", element: <PrivateRoute isAuth={isAuth} element={<OrganizationsView />} /> },
  { path: "/inventory", element: <PrivateRoute isAuth={isAuth} element={<InventoryView />} /> },
  { path: "/finance", element: <PrivateRoute isAuth={isAuth} element={<FinanceView />} /> },
  { path: "/events", element: <PrivateRoute isAuth={isAuth} element={<EventsView />} /> },

  // fallback
  { path: "*", element: <LandingView /> },
];