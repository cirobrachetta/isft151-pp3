import LandingView from "../views/LandingPage";
import LoginView from "../views/LoginView";
import RegisterView from "../views/RegisterView";
import UserListView from "../views/UserListView";
import DashboardView from "../views/DashboardView";

import CashMovementsView from "../views/Transactions/CashMovementsView";
import DebtsView from "../views/Transactions/DebtsView";
import PaymentsView from "../views/Transactions/PaymentsView";

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
  {
    path: "/cash",
    element: <PrivateRoute isAuth={isAuth} element={<CashMovementsView />} />,
  },
  {
    path: "/debts",
    element: <PrivateRoute isAuth={isAuth} element={<DebtsView />} />,
  },
  {
    path: "/payments",
    element: <PrivateRoute isAuth={isAuth} element={<PaymentsView />} />,
  },
  { path: "*", element: <LandingView /> },
];