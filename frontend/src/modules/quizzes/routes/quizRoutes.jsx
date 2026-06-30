import React from 'react';
import CreateQuiz from '../pages/CreateQuiz';
import EditQuiz from '../pages/EditQuiz';
import QuizDashboard from '../pages/QuizDashboard';
import TakeQuiz from '../pages/TakeQuiz';
import ReviewQuiz from '../pages/ReviewQuiz';

const quizRoutes = [
  {
    path: '/quizzes/create',
    element: <CreateQuiz />,
  },
  {
    path: '/quizzes/edit/:id',
    element: <EditQuiz />,
  },
  {
    path: '/quizzes/:id/manage',
    element: <QuizDashboard />,
  },
  {
    path: '/quizzes/:id/take',
    element: <TakeQuiz />,
  },
  {
    path: '/quizzes/attempts/:attemptId/review',
    element: <ReviewQuiz />,
  },
];

export default quizRoutes;
