import LandingView from "../views/LandingPage";
import LoginView from "../views/LoginView";
import RegisterView from "../views/RegisterView";
import UserListView from "../views/UserListView";
import DashboardView from "../views/DashboardView";

import CashMovementsView from "../views/Transactions/CashMovementsView";
import DebtsView from "../views/Transactions/DebtsView";
import PaymentsView from "../views/Transactions/PaymentsView";
import FinanceView from "../views/Transactions/FinanceView";

import PrivateRoute from "../components/PrivateRoute";
import InventoryView from "../views/InventoryView";
import EventsView from "../views/EventsView";
import OrganizationsView from "../views/OrganizationView";
import OrganizationSelectView from "../views/OrganizationSelectView";

export const routesConfig = (isAuth, handleLogin) => [
  { path: "/", element: <LandingView /> },
  { path: "/login", element: <LoginView onLogin={handleLogin} /> },
  { path: "/register", element: <RegisterView /> },

  // privadas
  { path: "/dashboard", element: <PrivateRoute isAuth={isAuth} element={<DashboardView />} /> },
  { path: "/users", element: <PrivateRoute isAuth={isAuth} element={<UserListView />} /> },
  { path: "/organizations", element: <PrivateRoute isAuth={isAuth} element={<OrganizationsView />} /> },
  { path: "/inventory", element: <PrivateRoute isAuth={isAuth} element={<InventoryView />} /> },
  { path: "/cash", element: <PrivateRoute isAuth={isAuth} element={<CashMovementsView />} />,},
  { path: "/debts", element: <PrivateRoute isAuth={isAuth} element={<DebtsView />} />,},
  { path: "/payments", element: <PrivateRoute isAuth={isAuth} element={<PaymentsView />} />,},
  { path: "/events", element: <PrivateRoute isAuth={isAuth} element={<EventsView />} /> },
  { path: "/select-org", element: <PrivateRoute isAuth={isAuth} element={<OrganizationSelectView />} /> },
  { path: "/finance", element: <PrivateRoute isAuth={isAuth} element={<FinanceView />} /> },

  // fallback
  { path: "*", element: <LandingView /> },
];