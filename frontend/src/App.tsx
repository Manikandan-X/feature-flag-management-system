import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { FlagsListPage } from "./pages/flags/FlagsListPage";
import { FlagDetailPage } from "./pages/flags/FlagDetailPage";
import { EnvironmentsPage } from "./pages/environments/EnvironmentsPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { AuditLogsPage } from "./pages/audit/AuditLogsPage";
import { UsersPage } from "./pages/users/UsersPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/flags" element={<FlagsListPage />} />
          <Route path="/flags/:id" element={<FlagDetailPage />} />
          <Route path="/environments" element={<EnvironmentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
