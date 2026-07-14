import { ReportService } from '../services/report.service.js';

export class ReportController {
  /**
   * Handles creating a new content report.
   */
  static async create(req, res, next) {
    try {
      const { reason, postId, threadId } = req.body;
      if (!reason) {
        return res.status(400).json({ error: 'Reason for reporting is required.' });
      }
      if (!postId && !threadId) {
        return res.status(400).json({ error: 'Either postId or threadId is required.' });
      }

      const report = await ReportService.createReport({
        userId: req.user.id,
        reason,
        postId,
        threadId
      });

      return res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles listing all moderation reports.
   * Privileged endpoint: Teacher/Admin roles only.
   */
  static async getAll(req, res, next) {
    try {
      if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Teachers or Admins only.' });
      }

      const reports = await ReportService.getAllReports();
      return res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles resolving a moderation report.
   * Privileged endpoint: Teacher/Admin roles only.
   */
  static async resolve(req, res, next) {
    try {
      const { reportId } = req.params;
      if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Teachers or Admins only.' });
      }

      const updated = await ReportService.resolveReport(reportId);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
}
