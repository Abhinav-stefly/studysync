import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProblemsPage } from "./pages/problems/ProblemsPage";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
        <Route path="/" element={<ProblemsPage />} />
          <Route path="/" element={<div className="font-display text-2xl">Problems (placeholder)</div>} />
          <Route path="/notes" element={<div className="font-display text-2xl">Notes (placeholder)</div>} />
          <Route path="/plans" element={<div className="font-display text-2xl">Study plans (placeholder)</div>} />
          <Route path="/rooms" element={<div className="font-display text-2xl">Study rooms (placeholder)</div>} />
          <Route path="/analytics" element={<div className="font-display text-2xl">Analytics (placeholder)</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;