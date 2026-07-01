import prisma from '../../../config/db.js';

export class AssignmentService {

  /**
   * Creates a new assignment for a course.
   */
  static async createAssignment({ courseId, teacherId, title, description, dueDate, totalMarks }) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.assignment.create({
      data: {
        courseId,
        teacherId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        totalMarks: totalMarks || 100
      },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true, email: true } }
      }
    });
  }

  /**
   * Get all assignments for a course.
   */
  static async getAssignmentsByCourse(courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.assignment.findMany({
      where: { courseId },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Get a single assignment by ID.
   */
  static async getAssignmentById(id) {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { submissions: true } }
      }
    });

    if (!assignment) {
      const error = new Error('Assignment not found.');
      error.statusCode = 404;
      throw error;
    }

    return assignment;
  }

  /**
   * Update an assignment.
   */
  static async updateAssignment(id, { title, description, dueDate, totalMarks }) {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      const error = new Error('Assignment not found.');
      error.statusCode = 404;
      throw error;
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;

    if (Object.keys(updateData).length === 0) {
      const error = new Error('At least one field must be provided.');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true } }
      }
    });
  }

  /**
   * Delete an assignment.
   */
  static async deleteAssignment(id) {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      const error = new Error('Assignment not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.assignment.delete({ where: { id } });
  }

  // ─── SUBMISSION SERVICES ────────────────────────────────────────────────────

  /**
   * Student submits an assignment.
   */
  static async submitAssignment({ assignmentId, studentId, fileUrl, notes }) {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      const error = new Error('Assignment not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if already submitted
    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } }
    });
    if (existing) {
      const error = new Error('You have already submitted this assignment.');
      error.statusCode = 409;
      throw error;
    }

    // Check if submission is late
    const isLate = new Date() > new Date(assignment.dueDate);

    return await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl: fileUrl || null,
        notes: notes || null,
        status: isLate ? 'LATE' : 'SUBMITTED'
      },
      include: {
        assignment: { select: { id: true, title: true, dueDate: true } },
        student: { select: { id: true, name: true, email: true } }
      }
    });
  }

  /**
   * Get all submissions for an assignment (Teacher view).
   */
  static async getSubmissionsByAssignment(assignmentId) {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      const error = new Error('Assignment not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, name: true, email: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }

  /**
   * Get a student's own submission for an assignment.
   */
  static async getMySubmission(assignmentId, studentId) {
    const submission = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      include: {
        assignment: { select: { id: true, title: true, dueDate: true, totalMarks: true } }
      }
    });

    if (!submission) {
      const error = new Error('Submission not found.');
      error.statusCode = 404;
      throw error;
    }

    return submission;
  }

  /**
   * Teacher grades a submission.
   */
  static async gradeSubmission(submissionId, { grade, feedback, totalMarks }) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true }
    });

    if (!submission) {
      const error = new Error('Submission not found.');
      error.statusCode = 404;
      throw error;
    }

    const maxMarks = submission.assignment.totalMarks;
    if (grade < 0 || grade > maxMarks) {
      const error = new Error(`Grade must be between 0 and ${maxMarks}.`);
      error.statusCode = 400;
      throw error;
    }

    return await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback: feedback || null,
        status: 'GRADED',
        gradedAt: new Date()
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { id: true, title: true, totalMarks: true } }
      }
    });
  }

  /**
   * Get all submissions by a student across all assignments.
   */
  static async getMyAllSubmissions(studentId) {
    return await prisma.submission.findMany({
      where: { studentId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            totalMarks: true,
            course: { select: { id: true, title: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }
}