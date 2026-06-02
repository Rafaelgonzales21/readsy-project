import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import PrivateRoute from "./components/PrivateRoute";


import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import ComparePage from "./pages/ComparePage";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protegidas — requieren login */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<HistoryPage/>} />
            <Route path="/dashboard" element={<DashboardPage/>}/>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/compare" element={<ComparePage/>}/>
          </Route>

          {/* Cualquier ruta desconocida → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;