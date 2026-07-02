import prisma from '../../../config/db.js';

export class CompletionController {
  static async getCourseProgress(studentId, courseId) {
    const totalQuizzes = await prisma.quiz.count({
      where: { courseId },
    });

    const completed = await prisma.quizAttempt.findMany({
      where: {
        studentId,
        submittedAt: { not: null },
        quiz: { courseId },
      },
      distinct: ['quizId'],
      select: { quizId: true },
    });

    const completedQuizzes = completed.length;

    const progressPercentage =
      totalQuizzes === 0
        ? 0
        : Math.round((completedQuizzes / totalQuizzes) * 100);

    return {
      totalQuizzes,
      completedQuizzes,
      progressPercentage,
    };
  }
}
