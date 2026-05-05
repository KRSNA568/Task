import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './guards/PrivateRoute';
import AdminRoute from './guards/AdminRoute';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import Members from './pages/Members';
import Settings from './pages/Settings';

function ShellRoute({ breadcrumbs, element }) {
  return (
    <Routes>
      <Route element={<AppShell breadcrumbs={breadcrumbs} />}>
        <Route index element={element} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/my-tasks" element={<MyTasks />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/members" element={<Members />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
