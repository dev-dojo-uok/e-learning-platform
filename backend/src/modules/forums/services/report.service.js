import prisma from '../../../config/db.js';

export class ReportService {
  /**
   * Creates a new moderation report.
   */
  static async createReport({ userId, reason, postId, threadId }) {
    return await prisma.report.create({
      data: {
        userId,
        reason,
        postId: postId || null,
        threadId: threadId || null
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
  }

  /**
   * Returns all moderation reports sorted by creation date.
   */
  static async getAllReports() {
    return await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        post: {
          select: {
            id: true,
            content: true,
            creator: { select: { id: true, name: true } },
            thread: { select: { id: true, title: true } }
          }
        },
        thread: {
          select: {
            id: true,
            title: true,
            creator: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  /**
   * Resolves a moderation report by marking its status as RESOLVED.
   */
  static async resolveReport(reportId) {
    return await prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED' }
    });
  }
}
