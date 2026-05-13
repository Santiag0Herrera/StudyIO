import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { TodayView } from './pages/TodayView';
import { TaskFocus } from './pages/TaskFocus';
import { Replanning } from './pages/Replanning';
import { Progress } from './pages/Progress';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isOnboarded = localStorage.getItem('studyflow-onboarded');
  return isOnboarded ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route
          path="/today"
          element={
            <ProtectedRoute>
              <TodayView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/focus/:taskId"
          element={
            <ProtectedRoute>
              <TaskFocus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/replanning"
          element={
            <ProtectedRoute>
              <Replanning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}