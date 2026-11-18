
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { ReactNode } from 'react';

import Shell from './components/Shell';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import Sessions from './pages/Sessions';
import Reports from './pages/Reports';
import Planner from './pages/Planner';
import AIChat from './pages/AIChat';

import { api, refreshAccessToken } from './services/api';
import { setCredentials, clearCredentials } from './features/auth/authSlice';

function Protected({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await refreshAccessToken();

        if (token) {
          const me = await api.get('/auth/me');

          if (alive) {
            dispatch(setCredentials(me.data.data.user));
            setAllowed(true);
          }
        } else if (alive) {
          dispatch(clearCredentials());
        }
      } catch {
        if (alive) {
          dispatch(clearCredentials());
        }
      } finally {
        if (alive) {
          setChecking(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [dispatch]);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b1020] text-slate-400">
        Loading StudyPilot...
      </div>
    );
  }

  return allowed ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<Protected><Shell /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
