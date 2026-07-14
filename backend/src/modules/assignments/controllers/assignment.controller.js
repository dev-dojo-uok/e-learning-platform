import { AssignmentService } from '../services/assignment.service.js';
import { StorageService } from '../../../services/storageService.js';

export class AssignmentController {

  // ASSIGNMENT CRUD

  /**
   * POST /api/assignments
   * Teacher creates a new assignment.
   */
  static async create(req, res, next) {
    try {
      const { courseId, title, description, dueDate, totalMarks, sectionId } = req.body;
      const assignment = await AssignmentService.createAssignment({
        courseId,
        teacherId: req.user.id,
        title,
        description,
        dueDate,
        totalMarks,
        sectionId
      });
      return res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assignments/course/:courseId
   * Get all assignments for a course.
   */
  static async getByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const assignments = await AssignmentService.getAssignmentsByCourse(courseId);
      return res.status(200).json(assignments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assignments/:id
   * Get a single assignment by ID.
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await AssignmentService.getAssignmentById(id);
      return res.status(200).json(assignment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/assignments/:id
   * Teacher updates an assignment.
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await AssignmentService.getAssignmentById(id);

      if (req.user?.role !== 'ADMIN' && existing.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'You are not allowed to update this assignment.' });
      }

      const { title, description, dueDate, totalMarks } = req.body;
      const assignment = await AssignmentService.updateAssignment(id, { title, description, dueDate, totalMarks });
      return res.status(200).json(assignment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/assignments/:id
   * Teacher deletes an assignment.
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await AssignmentService.getAssignmentById(id);

      if (req.user?.role !== 'ADMIN' && existing.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'You are not allowed to delete this assignment.' });
      }

      await AssignmentService.deleteAssignment(id);
      return res.status(200).json({ message: 'Assignment deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // SUBMISSION CRUD

  /**
   * POST /api/assignments/:id/submit
   * Student submits an assignment.
   */
  static async submit(req, res, next) {
    try {
      const { id: assignmentId } = req.params;
      const { notes } = req.body;
      let { fileUrl } = req.body;

      if (req.file) {
        // Upload the file using StorageService (handling S3 or local fallback)
        fileUrl = await StorageService.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'submissions'
        );
      }

      if (!fileUrl) {
        return res.status(400).json({ error: 'A file upload or file URL is required.' });
      }

      const submission = await AssignmentService.submitAssignment({
        assignmentId,
        studentId: req.user.id,
        fileUrl,
        notes
      });
      return res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assignments/:id/submissions
   * Teacher views all submissions for an assignment.
   */
  static async getSubmissions(req, res, next) {
    try {
      const { id: assignmentId } = req.params;
      const submissions = await AssignmentService.getSubmissionsByAssignment(assignmentId);
      return res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assignments/:id/my-submission
   * Student views their own submission.
   */
  static async getMySubmission(req, res, next) {
    try {
      const { id: assignmentId } = req.params;
      const submission = await AssignmentService.getMySubmission(assignmentId, req.user.id);
      return res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/assignments/submissions/:submissionId/grade
   * Teacher grades a submission.
   */
  static async grade(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;
      const submission = await AssignmentService.gradeSubmission(submissionId, { grade, feedback });
      return res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assignments/my-submissions
   * Student views all their submissions across all assignments.
   */
  static async getMyAllSubmissions(req, res, next) {
    try {
      const submissions = await AssignmentService.getMyAllSubmissions(req.user.id);
      return res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  }
}