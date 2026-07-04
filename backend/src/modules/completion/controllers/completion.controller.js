import prisma from '../../../config/db.js';

export class CompletionController {
  static async getCourseProgress(studentId, courseId) {
    // 1. QUIZ METRICS FETCHING
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

    // 2. ASSIGNMENT METRICS FETCHING
    const totalAssignments = await prisma.assignment.count({
      where: { courseId },
    });

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        dueDate: true,
        submissions: {
          where: {
            studentId: studentId,
            status: { in: ['SUBMITTED', 'GRADED'] }
          },
          select: {
            id: true
          }
        }
      }
    });

    const completedAssignments = assignments.filter(
      (assignment) => assignment.submissions && assignment.submissions.length > 0
    ).length;

    // 3. AGGREGATED CALCULATIONS & PAYLOAD RETURN
    const totalTasks = totalQuizzes + totalAssignments;
    const completedTasks = completedQuizzes + completedAssignments;

    const progressPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    return {
      totalQuizzes,
      completedQuizzes,
      totalAssignments,
      completedAssignments,
      progressPercentage,
      assignments
    };
  }
}