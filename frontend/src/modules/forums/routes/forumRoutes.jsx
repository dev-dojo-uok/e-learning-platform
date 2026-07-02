import React from 'react';
import CourseForumsPage from '../pages/CourseForumsPage';
import ForumThreadsPage from '../pages/ForumThreadsPage';
import ThreadDetailPage from '../pages/ThreadDetailPage';

/**
 * Forum module route definitions.
 * Consumed by App.jsx the same way courseRoutes are.
 */
const forumRoutes = [
  {
    path: '/courses/:courseId/forums',
    element: <CourseForumsPage />,
  },
  {
    path: '/forums/:forumId/threads',
    element: <ForumThreadsPage />,
  },
  {
    path: '/threads/:threadId',
    element: <ThreadDetailPage />,
  },
];

export default forumRoutes;
