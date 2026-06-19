import React from 'react';
import CourseList from '../pages/CourseList';
import CreateCourse from '../pages/CreateCourse';
import EditCourse from '../pages/EditCourse';
import CourseDetails from '../pages/CourseDetails';

const courseRoutes = [
  {
    path: '/courses',
    element: <CourseList />,
  },
  {
    path: '/courses/create',
    element: <CreateCourse />,
  },
  {
    path: '/courses/edit/:id',
    element: <EditCourse />,
  },
  {
    path: '/courses/:id',
    element: <CourseDetails />,
  },
];

export default courseRoutes;
