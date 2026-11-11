
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import FraudDetection from "./pages/FraudDetection";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Payment from "./pages/Payment";


/* =========================================
   AUTHENTICATION CHECK
========================================= */

function ProtectedRoute() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}


/* =========================================
   APPLICATION ROUTES
========================================= */

function AppRoutes() {
  const navigate = useNavigate();

  function handleLogout() {
    // Remove authentication information.
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Return to login page.
    navigate("/login", { replace: true });
  }

  return (
    <Routes>

      {/* =====================================
          PUBLIC ROUTES
      ===================================== */}

      {/* Landing */}
      <Route
        path="/"
        element={<Landing />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          <Login
            onLogin={() => navigate("/dashboard", { replace: true })}
            onRegister={() => navigate("/register")}
            onBack={() => navigate("/")}
          />
        }
      />

      {/* Register */}
      <Route
        path="/register"
        element={
          <Register
            onRegister={() => navigate("/dashboard", { replace: true })}
            onLogin={() => navigate("/login")}
            onBack={() => navigate("/")}
          />
        }
      />


      {/* =====================================
          PROTECTED ROUTES
      ===================================== */}

      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Dashboard
              onLogout={handleLogout}
            />
          }
        />

        {/* Transactions */}
        <Route
          path="/transactions"
          element={<Transactions />}
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* Fraud Detection */}
        <Route
          path="/fraud-detection"
          element={<FraudDetection />}
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={<Customers />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* PayPal Payments */}
        <Route
          path="/payment"
          element={<Payment />}
        />

      </Route>


      {/* =====================================
          UNKNOWN ROUTES
      ===================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


/* =========================================
   MAIN APPLICATION
========================================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
