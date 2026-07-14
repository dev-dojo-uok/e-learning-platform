import prisma from '../../../config/db.js';
import { StorageService } from '../../../services/storageService.js';
import { randomUUID } from 'crypto';

async function processDescriptionThumbnail(description, existingThumbnail = null) {
  if (!description) return { description: null, thumbnail: existingThumbnail };
  
  let thumbnail = existingThumbnail;
  let cleanDescription = description;

  // 1. Check for base64 thumbnail
  const base64Match = description.match(/<!--thumbnail: (data:image\/[^;]+;base64,.*?)-->/);
  if (base64Match) {
    const base64Data = base64Match[1];
    const matches = base64Data.match(/^data:image\/([^;]+);base64,(.*)$/);
    if (matches) {
      const ext = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `thumbnail-${randomUUID()}.${ext}`;
      
      const fileUrl = await StorageService.uploadFile(
        buffer,
        filename,
        `image/${ext}`,
        'thumbnails'
      );
      thumbnail = fileUrl;
    }
  } else {
    // 2. Check for standard/mapped thumbnail value (e.g. "react" or existing URL)
    const standardMatch = description.match(/<!--thumbnail: (.*?)-->/);
    if (standardMatch) {
      thumbnail = standardMatch[1];
    }
  }

  // Strip the thumbnail comment tag out of the description
  cleanDescription = description.replace(/<!--thumbnail: (.*?)-->/, '').trim();

  return { description: cleanDescription || null, thumbnail };
}

export class CourseService {
  /**
   * Creates a new course.
   * Ensures that the teacher exists and has TEACHER or ADMIN privileges.
   */
  static async createCourse({ title, description, teacherId }) {
    // 1. Verify that teacher exists and has proper permissions
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      const error = new Error('Teacher with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN') {
      const error = new Error('Designated user is not authorized to teach courses (must be TEACHER or ADMIN).');
      error.statusCode = 403;
      throw error;
    }

    const { description: cleanDesc, thumbnail } = await processDescriptionThumbnail(description);

    // 2. Create course and return it with basic teacher info
    return await prisma.course.create({
      data: {
        title,
        description: cleanDesc,
        thumbnail,
        teacherId
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Retrieves all courses including basic teacher info.
   */
  static async getAllCourses() {
    return await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Retrieves all courses belonging to a specific teacher.
   */
  static async getCoursesByTeacher(teacherId) {
    return await prisma.course.findMany({
      where: { teacherId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Retrieves a course by ID. Throws 404 if course is not found.
   */
  static async getCourseById(id) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    return course;
  }

  /**
   * Updates an existing course. Throws 404 if course is not found.
   */
  static async updateCourse(id, { title, description }) {
    // 1. Ensure course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Build update payload dynamically
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    
    if (description !== undefined) {
      const { description: cleanDesc, thumbnail: newThumbnail } = await processDescriptionThumbnail(description, course.thumbnail);
      updateData.description = cleanDesc;
      updateData.thumbnail = newThumbnail;

      if (course.thumbnail && course.thumbnail !== newThumbnail && StorageService.isCustomUploadedUrl(course.thumbnail)) {
        await StorageService.deleteFile(course.thumbnail);
      }
    }

    if (Object.keys(updateData).length === 0) {
      const error = new Error('At least one field (title or description) must be provided.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Update database record
    return await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Deletes a course. Throws 404 if course is not found.
   */
  static async deleteCourse(id) {
    // 1. Ensure course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    if (course.thumbnail && StorageService.isCustomUploadedUrl(course.thumbnail)) {
      await StorageService.deleteFile(course.thumbnail);
    }

    // 2. Perform deletion (cascade deletes sections/materials due to schema setup)
    return await prisma.course.delete({
      where: { id }
    });
  }
}
