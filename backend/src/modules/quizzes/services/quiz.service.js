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
   * Creates a new quiz and inserts a corresponding Material entry.
   */
  static async createQuiz({ sectionId, courseId, title, hasTimeLimit, timeLimitMinutes, minPassMark, reviewPolicy, reviewPublishTime, attemptLimit, openTime, closeTime, questionsJson }) {
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
        reviewPolicy: reviewPolicy || 'IMMEDIATE',
        reviewPublishTime: reviewPublishTime ? new Date(reviewPublishTime) : null,
        attemptLimit: attemptLimit !== undefined ? parseInt(attemptLimit, 10) : 2,
        openTime: openTime ? new Date(openTime) : null,
        closeTime: closeTime ? new Date(closeTime) : null,
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
   * unless the student has already submitted a completed attempt and the review policy allows it.
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

    // Security: Student role gets stripped questions unless they completed an attempt and policy allows
    if (userRole === 'STUDENT') {
      const completedAttempt = await prisma.quizAttempt.findFirst({
        where: {
          quizId: id,
          studentId: userId,
          submittedAt: { not: null }
        }
      });

      let allowReview = false;
      if (completedAttempt) {
        if (quiz.reviewPolicy === 'IMMEDIATE') {
          allowReview = true;
        } else if (quiz.reviewPolicy === 'LATER') {
          if (quiz.reviewPublishTime && new Date() >= new Date(quiz.reviewPublishTime)) {
            allowReview = true;
          }
        }
      }

      if (!allowReview) {
        quiz.questionsJson = QuizService._stripCorrectAnswers(quiz.questionsJson);
      }
    }

    return quiz;
  }

  /**
   * Updates an existing quiz.
   */
  static async updateQuiz(id, { title, hasTimeLimit, timeLimitMinutes, minPassMark, reviewPolicy, reviewPublishTime, attemptLimit, openTime, closeTime, questionsJson }) {
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
    if (reviewPolicy !== undefined) updateData.reviewPolicy = reviewPolicy;
    if (reviewPublishTime !== undefined) updateData.reviewPublishTime = reviewPublishTime ? new Date(reviewPublishTime) : null;
    if (attemptLimit !== undefined) updateData.attemptLimit = parseInt(attemptLimit, 10);
    if (openTime !== undefined) updateData.openTime = openTime ? new Date(openTime) : null;
    if (closeTime !== undefined) updateData.closeTime = closeTime ? new Date(closeTime) : null;
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

    // 1. Open/Close Time Checks
    const now = new Date();
    if (quiz.openTime && now < new Date(quiz.openTime)) {
      const error = new Error(`This quiz is not open yet. It will open on ${quiz.openTime.toLocaleString()}.`);
      error.statusCode = 400;
      throw error;
    }
    if (quiz.closeTime && now > new Date(quiz.closeTime)) {
      const error = new Error(`This quiz is closed. It closed on ${quiz.closeTime.toLocaleString()}.`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Return current active (unsubmitted) attempt if it exists
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

    // 3. Finalization Checks
    const finalizedAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId,
        isFinal: true
      }
    });
    if (finalizedAttempt) {
      const error = new Error('You have finalized your submission for this quiz. No further attempts can be started.');
      error.statusCode = 400;
      throw error;
    }

    // 4. Attempt Limit Checks
    const attemptsCount = await prisma.quizAttempt.count({
      where: {
        quizId,
        studentId,
        submittedAt: { not: null }
      }
    });
    if (attemptsCount >= quiz.attemptLimit) {
      const error = new Error(`You have reached the maximum allowed attempts of ${quiz.attemptLimit} for this quiz.`);
      error.statusCode = 400;
      throw error;
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
        
        totalPoints += 1.0;

        const studentAns = answers[qId];
        if (correctAns !== undefined && studentAns !== undefined) {
          const formattedStudentAns = String(studentAns).trim().toLowerCase();
          const formattedCorrectAns = String(correctAns).trim().toLowerCase();
          if (formattedStudentAns === formattedCorrectAns) {
            earnedPoints += 1.0;
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

    // Enforce review policy for students
    if (userRole === 'STUDENT' && attempt.quiz) {
      let allowReview = false;

      // Check if student has finalized their attempts for this quiz
      const finalized = await prisma.quizAttempt.findFirst({
        where: {
          quizId: attempt.quizId,
          studentId: userId,
          isFinal: true
        }
      });

      if (attempt.submittedAt) {
        if (finalized || (attempt.quiz.closeTime && new Date() > new Date(attempt.quiz.closeTime))) {
          allowReview = true;
        } else if (attempt.quiz.reviewPolicy === 'IMMEDIATE') {
          // Only show immediately if they finalized or have exhausted all attempts
          const attemptsCount = await prisma.quizAttempt.count({
            where: {
              quizId: attempt.quizId,
              studentId: userId,
              submittedAt: { not: null }
            }
          });
          if (attemptsCount >= attempt.quiz.attemptLimit) {
            allowReview = true;
          }
        } else if (attempt.quiz.reviewPolicy === 'LATER') {
          if (attempt.quiz.reviewPublishTime && new Date() >= new Date(attempt.quiz.reviewPublishTime)) {
            allowReview = true;
          }
        }
      }

      if (!allowReview) {
        attempt.quiz.questionsJson = QuizService._stripCorrectAnswers(attempt.quiz.questionsJson);
      }
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

  /**
   * Saves a draft of answers for an active attempt without grading or submitting it.
   */
  static async saveDraft(attemptId, studentId, { submittedAnswersJson }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId }
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

    return await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAnswersJson: answers
      }
    });
  }

  /**
   * Finalizes quiz attempts for a student, unlocking reviews and locking new attempts.
   */
  static async finalizeAttempt(attemptId, studentId) {
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

    if (!attempt.submittedAt) {
      const error = new Error('Cannot finalize an active, unsubmitted attempt.');
      error.statusCode = 400;
      throw error;
    }

    if (attempt.quiz.attemptLimit <= 1) {
      const error = new Error('Finalization is only applicable for quizzes with multiple attempts.');
      error.statusCode = 400;
      throw error;
    }

    // Set isFinal: true
    return await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        isFinal: true
      }
    });
  }
}
