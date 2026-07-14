import prisma from '../../../config/db.js';
import { MATERIAL_TYPE_MAP } from '../validations/material.validation.js';
import { StorageService } from '../../../services/storageService.js';

// ---------------------------------------------------------------------------
// File-based material types that require a physical upload
// ---------------------------------------------------------------------------
const FILE_BASED_TYPES = ['PDF', 'DOCUMENT', 'IMAGE', 'ZIP'];

export class MaterialService {
  /**
   * Creates a new material record.
   *
   * Type-specific rules enforced here:
   *  - FILE_BASED_TYPES  → req.file must be present; contentUrl set to file path
   *  - VIDEO             → contentUrl required in body
   *  - YOUTUBE           → embedCode required in body
   */
  static async createMaterial({ sectionId, title, description, type, contentUrl, embedCode, isGraded, gradingWeight, file }) {
    // 1. Verify parent section exists
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId }
    });

    if (!section) {
      const error = new Error('Course section (module) with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate type-specific requirements
    MaterialService._validateTypeRequirements(type, contentUrl, embedCode, file);

    // 3. Build content fields
    let resolvedContentUrl = null;
    if (FILE_BASED_TYPES.includes(type) && file) {
      resolvedContentUrl = await StorageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'materials'
      );
    } else if (type === 'VIDEO') {
      resolvedContentUrl = contentUrl || null;
    }
    const resolvedEmbedCode  = type === 'YOUTUBE' ? (embedCode || null) : null;

    // 4. Map API type → Prisma enum
    const prismaType = MATERIAL_TYPE_MAP[type];

    // 5. Create and return the material
    return await prisma.material.create({
      data: {
        sectionId,
        title,
        description:   description   || null,
        type:          prismaType,
        contentUrl:    resolvedContentUrl,
        embedCode:     resolvedEmbedCode,
        isGraded:      isGraded      !== undefined ? Boolean(isGraded) : false,
        gradingWeight: gradingWeight !== undefined ? parseFloat(gradingWeight) : 0.0
      },
      include: {
        section: {
          select: {
            id:       true,
            title:    true,
            courseId: true
          }
        }
      }
    });
  }

  /**
   * Returns all materials belonging to a specific section, sorted by createdAt asc.
   * Throws 404 if the section does not exist.
   */
  static async getMaterialsBySection(sectionId) {
    // Verify section exists
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId }
    });

    if (!section) {
      const error = new Error('Course section (module) with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.material.findMany({
      where: { sectionId },
      orderBy: { createdAt: 'asc' },
      include: {
        section: {
          select: {
            id:       true,
            title:    true,
            courseId: true
          }
        }
      }
    });
  }

  /**
   * Returns a single material by ID. Throws 404 if not found.
   */
  static async getMaterialById(id) {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        section: {
          select: {
            id:       true,
            title:    true,
            courseId: true
          }
        }
      }
    });

    if (!material) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    return material;
  }

  /**
   * Updates an existing material. Throws 404 if not found.
   * Supports optional file replacement; keeps existing file if no new file provided.
   */
  static async updateMaterial(id, { title, description, type, contentUrl, embedCode, isGraded, gradingWeight, file }) {
    // 1. Ensure material exists
    const existing = await prisma.material.findUnique({
      where: { id }
    });

    if (!existing) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Build dynamic update payload
    const updateData = {};

    if (title       !== undefined) updateData.title       = title;
    if (description !== undefined) updateData.description = description || null;
    if (isGraded    !== undefined) updateData.isGraded    = Boolean(isGraded);
    if (gradingWeight !== undefined) updateData.gradingWeight = parseFloat(gradingWeight);

    // Handle type change + content fields
    if (type !== undefined) {
      MaterialService._validateTypeRequirements(type, contentUrl, embedCode, file);
      updateData.type = MATERIAL_TYPE_MAP[type];

      let resolvedContentUrl = null;
      if (FILE_BASED_TYPES.includes(type) && file) {
        resolvedContentUrl = await StorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          'materials'
        );
      } else if (type === 'VIDEO') {
        resolvedContentUrl = contentUrl || null;
      }
      updateData.contentUrl = resolvedContentUrl;
      updateData.embedCode  = type === 'YOUTUBE' ? (embedCode || null) : null;

      // Delete old file if the material had one and a new one is replacing it or type changed
      if (existing.contentUrl && StorageService.isCustomUploadedUrl(existing.contentUrl)) {
        await StorageService.deleteFile(existing.contentUrl);
      }
    } else {
      // No type change; handle file replacement or plain URL update
      if (file) {
        // Only allow file replacement for file-based persisted types
        if (!['PDF', 'FILE'].includes(existing.type)) {
          const error = new Error('File upload is only allowed for file-based materials. Provide "type" to change the material type.');
          error.statusCode = 400;
          throw error;
        }

        updateData.contentUrl = await StorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          'materials'
        );
        if (existing.contentUrl && StorageService.isCustomUploadedUrl(existing.contentUrl)) {
          await StorageService.deleteFile(existing.contentUrl);
        }
      } else if (contentUrl !== undefined) {
        // Only VIDEO_SRC materials should have a contentUrl
        if (existing.type !== 'VIDEO_SRC') {
          const error = new Error('contentUrl can only be set for VIDEO materials.');
          error.statusCode = 400;
          throw error;
        }
        updateData.contentUrl = contentUrl || null;
      }

      if (embedCode !== undefined) {
        // Only VIDEO_EMBED materials should have embedCode
        if (existing.type !== 'VIDEO_EMBED') {
          const error = new Error('embedCode can only be set for YOUTUBE materials.');
          error.statusCode = 400;
          throw error;
        }
        updateData.embedCode = embedCode || null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      const error = new Error('At least one updatable field must be provided.');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.material.update({
      where: { id },
      data:  updateData,
      include: {
        section: {
          select: {
            id:       true,
            title:    true,
            courseId: true
          }
        }
      }
    });
  }

  /**
   * Deletes a material. Throws 404 if not found.
   * Also removes any uploaded file from disk storage.
   */
  static async deleteMaterial(id) {
    // 1. Ensure material exists
    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Remove from database
    await prisma.material.delete({ where: { id } });

    // 3. Remove file from S3 or disk if applicable
    if (material.contentUrl && StorageService.isCustomUploadedUrl(material.contentUrl)) {
      await StorageService.deleteFile(material.contentUrl);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Enforces per-type content requirements and throws 400 if violated.
   */
  static _validateTypeRequirements(type, contentUrl, embedCode, file) {
    if (FILE_BASED_TYPES.includes(type)) {
      if (!file) {
        const error = new Error(`A file upload is required for material type "${type}".`);
        error.statusCode = 400;
        throw error;
      }
    }

    if (type === 'VIDEO') {
      if (!contentUrl) {
        const error = new Error('A valid "contentUrl" is required for VIDEO materials.');
        error.statusCode = 400;
        throw error;
      }
    }

    if (type === 'YOUTUBE') {
      if (!embedCode) {
        const error = new Error('An "embedCode" (YouTube URL) is required for YOUTUBE materials.');
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Note: Helper methods migrated to StorageService
}
