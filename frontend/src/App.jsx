import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import CoursesPlaceholder from './modules/courses';
import QuizzesPlaceholder from './modules/quizzes';
import ForumsPlaceholder from './modules/forums';
import CompletionPlaceholder from './modules/completion';
import AssignmentsPlaceholder from './modules/assignments';
import useAuthStore from './store/useAuthStore';
import TeacherDashboard from './modules/dashboard/TeacherDashboard';
import Loader from './components/Loader';

// Set base URL for API calls
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

function App() {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Check user authentication session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/whoami');
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('No active session.');
        clearUser();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setUser, clearUser]);

  if (loading) {
    return <Loader size="md" />;
  }

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" replace /> : <Register />} 
        />

        {/* Protected App Layout */}
        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={user?.role === 'TEACHER' || user?.role === 'ADMIN' ? <TeacherDashboard /> : <CoursesPlaceholder />} />
                  <Route path="/courses" element={<CoursesPlaceholder />} />
                  <Route path="/quizzes" element={<QuizzesPlaceholder />} />
                  <Route path="/forums" element={<ForumsPlaceholder />} />
                  <Route path="/completion" element={<CompletionPlaceholder />} />
                  <Route path="/assignments" element={<AssignmentsPlaceholder />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
