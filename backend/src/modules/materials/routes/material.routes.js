import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller.js';
import { authenticateToken, authorizeRole } from '../../../config/auth.js';
import { handleFileUpload } from '../middleware/upload.middleware.js';
import {
  validateCreateMaterial,
  validateUpdateMaterial,
  validateMaterialId,
  validateSectionIdParam
} from '../validations/material.validation.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/materials
// Create a new material (supports both JSON and multipart/form-data)
// ---------------------------------------------------------------------------
router.route('/')
  .post(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    handleFileUpload,            // parse optional file upload before validation
    validateCreateMaterial,
    MaterialController.create
  );

// ---------------------------------------------------------------------------
// GET /api/materials/module/:sectionId
// Get all materials belonging to a specific module (section)
// ---------------------------------------------------------------------------
router.route('/module/:sectionId')
  .get(validateSectionIdParam, MaterialController.getBySection);

// ---------------------------------------------------------------------------
// GET    /api/materials/:id   – Get a single material by ID
// PUT    /api/materials/:id   – Update a material (supports file replacement)
// DELETE /api/materials/:id   – Delete a material (removes file from disk)
// ---------------------------------------------------------------------------
router.route('/:id')
  .get(validateMaterialId, MaterialController.getById)
  .put(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    handleFileUpload,            // parse optional file upload before validation
    validateUpdateMaterial,
    MaterialController.update
  )
  .delete(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateMaterialId,
    MaterialController.delete
  );

export default router;
