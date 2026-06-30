import jwt from 'jsonwebtoken';
import prisma from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_phrase_here';

export function authenticateToken(req, res, next) {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

export function authorizeRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Unauthorized role permissions.' });
    }
    next();
  };
}

export async function verifyCourseOwner(req, res, next) {
  if (req.user?.role !== 'TEACHER') {
    return next();
  }

  const courseId = req.params.id || req.params.courseId || req.body.courseId;
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required for owner verification.' });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this course.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyModuleOwner(req, res, next) {
  if (req.user?.role !== 'TEACHER') {
    return next();
  }

  const moduleId = req.params.id;
  if (!moduleId) {
    return res.status(400).json({ error: 'Module ID is required for owner verification.' });
  }

  try {
    const module = await prisma.courseSection.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    if (module.course.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own the course this module belongs to.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifySectionOwner(req, res, next) {
  if (req.user?.role !== 'TEACHER') {
    return next();
  }

  const sectionId = req.params.sectionId || req.body.sectionId;
  if (!sectionId) {
    return res.status(400).json({ error: 'Section ID is required for owner verification.' });
  }

  try {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: true }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found.' });
    }

    if (section.course.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own the course this section belongs to.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyMaterialOwner(req, res, next) {
  if (req.user?.role !== 'TEACHER') {
    return next();
  }

  const materialId = req.params.id;
  if (!materialId) {
    return res.status(400).json({ error: 'Material ID is required for owner verification.' });
  }

  try {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        section: {
          include: { course: true }
        }
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    if (material.section.course.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own the course this material belongs to.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyQuizOwner(req, res, next) {
  if (req.user?.role !== 'TEACHER') {
    return next();
  }

  const quizId = req.params.id;
  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required for owner verification.' });
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (quiz.course.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own the course this quiz belongs to.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyAttemptOwner(req, res, next) {
  if (req.user?.role !== 'TEACHER') {
    return next();
  }

  const attemptId = req.params.attemptId;
  if (!attemptId) {
    return res.status(400).json({ error: 'Attempt ID is required for owner verification.' });
  }

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: { course: true }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found.' });
    }

    if (attempt.quiz.course.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own the course this quiz attempt belongs to.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}
