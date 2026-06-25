import prisma from '../../../config/db.js';

export class QuizService {
  /**
   * Helper to strip correct answers from questions array for security.
   */
  static _stripCorrectAnswers(questions) {
    if (!Array.isArray(questions)) return questions;
    return questions.map(q => {
      // Create a shallow copy and exclude answer properties
      const { correctAnswer, correctOption, feedback, ...rest } = q;
      return rest;
    });
  }

  /**
   * Creates a new Quiz and registers it as a Material of type QUIZ.
   */
  static async createQuiz({ sectionId, courseId, title, hasTimeLimit, timeLimitMinutes, minPassMark, questionsJson }) {
    // 1. Verify parent course section exists
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId }
    });
    if (!section) {
      const error = new Error('Course section (module) with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
      const error = new Error('Course with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const parsedQuestions = typeof questionsJson === 'string' ? JSON.parse(questionsJson) : questionsJson;

    // 3. Create the Quiz record
    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title,
        hasTimeLimit: Boolean(hasTimeLimit),
        timeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : 0,
        minPassMark: minPassMark ? parseFloat(minPassMark) : 0.0,
        questionsJson: parsedQuestions
      }
    });

    // 4. Create the corresponding Material record of type QUIZ
    await prisma.material.create({
      data: {
        sectionId,
        title,
        type: 'QUIZ',
        itemId: quiz.id,
        isGraded: true,
        gradingWeight: 0.0
      }
    });

    return quiz;
  }

  /**
   * Retrieves all quizzes belonging to a specific course.
   */
  static async getQuizzesByCourse(courseId) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
      const error = new Error('Course with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Retrieves a single quiz by ID.
   * If the role is STUDENT, filters out correct answers from questionsJson
   * unless the student has already submitted a completed attempt.
   */
  static async getQuizById(id, userRole, userId) {
    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      const error = new Error('Quiz not found.');
      error.statusCode = 404;
      throw error;
    }

    // Security: Student role gets stripped questions unless they completed an attempt
    if (userRole === 'STUDENT') {
      const completedAttempt = await prisma.quizAttempt.findFirst({
        where: {
          quizId: id,
          studentId: userId,
          submittedAt: { not: null }
        }
      });

      if (!completedAttempt) {
        quiz.questionsJson = QuizService._stripCorrectAnswers(quiz.questionsJson);
      }
    }

    return quiz;
  }

  /**
   * Updates an existing quiz.
   */
  static async updateQuiz(id, { title, hasTimeLimit, timeLimitMinutes, minPassMark, questionsJson }) {
    const existing = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!existing) {
      const error = new Error('Quiz not found.');
      error.statusCode = 404;
      throw error;
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (hasTimeLimit !== undefined) updateData.hasTimeLimit = Boolean(hasTimeLimit);
    if (timeLimitMinutes !== undefined) updateData.timeLimitMinutes = parseInt(timeLimitMinutes, 10);
    if (minPassMark !== undefined) updateData.minPassMark = parseFloat(minPassMark);
    if (questionsJson !== undefined) {
      updateData.questionsJson = typeof questionsJson === 'string' ? JSON.parse(questionsJson) : questionsJson;
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: updateData
    });

    // Sync title change to Material
    if (title !== undefined) {
      await prisma.material.updateMany({
        where: { itemId: id, type: 'QUIZ' },
        data: { title }
      });
    }

    return updatedQuiz;
  }

  /**
   * Deletes a quiz and its corresponding Material.
   */
  static async deleteQuiz(id) {
    const existing = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!existing) {
      const error = new Error('Quiz not found.');
      error.statusCode = 404;
      throw error;
    }

    // Delete Quiz (attempts will cascade delete via DB constraints)
    await prisma.quiz.delete({
      where: { id }
    });

    // Delete corresponding Material
    await prisma.material.deleteMany({
      where: { itemId: id, type: 'QUIZ' }
    });
  }

  /**
   * Starts a new attempt for a quiz (Student).
   */
  static async startAttempt(quizId, studentId) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      const error = new Error('Quiz not found.');
      error.statusCode = 404;
      throw error;
    }

    // Return current active (unsubmitted) attempt if it exists
    const activeAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId,
        submittedAt: null
      }
    });

    if (activeAttempt) {
      return activeAttempt;
    }

    return await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        startedAt: new Date()
      }
    });
  }

  /**
   * Submits and automatically grades a quiz attempt.
   */
  static async submitAttempt(attemptId, studentId, { submittedAnswersJson }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: true }
    });

    if (!attempt) {
      const error = new Error('Quiz attempt not found.');
      error.statusCode = 404;
      throw error;
    }

    if (attempt.studentId !== studentId) {
      const error = new Error('Access denied. This is not your quiz attempt.');
      error.statusCode = 403;
      throw error;
    }

    if (attempt.submittedAt) {
      const error = new Error('Quiz attempt has already been submitted.');
      error.statusCode = 400;
      throw error;
    }

    const answers = typeof submittedAnswersJson === 'string' ? JSON.parse(submittedAnswersJson) : submittedAnswersJson;
    const questions = attempt.quiz.questionsJson;

    let earnedPoints = 0;
    let totalPoints = 0;

    // Automatic grading logic
    if (Array.isArray(questions)) {
      questions.forEach((q) => {
        const qId = q.id;
        const correctAns = q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption;
        const points = q.points !== undefined ? parseFloat(q.points) : 1.0;
        
        totalPoints += points;

        const studentAns = answers[qId];
        if (correctAns !== undefined && studentAns !== undefined) {
          const formattedStudentAns = String(studentAns).trim().toLowerCase();
          const formattedCorrectAns = String(correctAns).trim().toLowerCase();
          if (formattedStudentAns === formattedCorrectAns) {
            earnedPoints += points;
          }
        }
      });
    }

    // Convert score to a percentage (0 to 100)
    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0.0;

    return await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAnswersJson: answers,
        score: parseFloat(scorePercentage.toFixed(2)),
        submittedAt: new Date()
      }
    });
  }

  /**
   * Retrieves a single attempt by ID.
   */
  static async getAttemptById(attemptId, userRole, userId) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: true,
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!attempt) {
      const error = new Error('Quiz attempt not found.');
      error.statusCode = 404;
      throw error;
    }

    if (userRole === 'STUDENT' && attempt.studentId !== userId) {
      const error = new Error('Access denied. Cannot view other student\'s attempt.');
      error.statusCode = 403;
      throw error;
    }

    return attempt;
  }

  /**
   * Retrieves attempts for a specific quiz.
   * If the role is STUDENT, only returns the student's own attempts.
   */
  static async getAttemptsByQuiz(quizId, userRole, userId) {
    const query = {
      where: { quizId },
      orderBy: { startedAt: 'desc' },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    };

    if (userRole === 'STUDENT') {
      query.where.studentId = userId;
    }

    return await prisma.quizAttempt.findMany(query);
  }

  /**
   * Manually grades or provides feedback on a quiz attempt (Teacher/Admin).
   */
  static async gradeAttempt(attemptId, { score, teacherFeedback }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      const error = new Error('Quiz attempt not found.');
      error.statusCode = 404;
      throw error;
    }

    const updateData = {};
    if (score !== undefined) updateData.score = parseFloat(score);
    if (teacherFeedback !== undefined) updateData.teacherFeedback = teacherFeedback;

    return await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: updateData,
      include: {
        quiz: true,
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }
}
