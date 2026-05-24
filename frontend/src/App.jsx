import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GpaCalculator from './pages/GpaCalculator.jsx';
import GpaPrediction from './pages/GpaPrediction.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import PerformanceAnalysis from './pages/PerformanceAnalysis.jsx';
import Signup from './pages/Signup.jsx';
import StudyRecommendations from './pages/StudyRecommendations.jsx';
import TargetGpaPlanner from './pages/TargetGpaPlanner.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/gpa-calculator" element={<GpaCalculator />} />
        <Route path="/performance-analysis" element={<PerformanceAnalysis />} />
        <Route path="/gpa-prediction" element={<GpaPrediction />} />
        <Route path="/target-gpa-planner" element={<TargetGpaPlanner />} />
        <Route path="/study-recommendations" element={<StudyRecommendations />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
