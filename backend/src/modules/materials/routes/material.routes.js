import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller.js';
import { authenticateToken, authorizeRole, verifySectionOwner, verifyMaterialOwner } from '../../../config/auth.js';
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
    verifySectionOwner,
    MaterialController.create
  );

// ---------------------------------------------------------------------------
// GET /api/materials/module/:sectionId
// Get all materials belonging to a specific module (section)
// ---------------------------------------------------------------------------
router.route('/module/:sectionId')
  .get(
    authenticateToken,
    validateSectionIdParam,
    verifySectionOwner,
    MaterialController.getBySection
  );

// ---------------------------------------------------------------------------
// GET    /api/materials/:id   – Get a single material by ID
// PUT    /api/materials/:id   – Update a material (supports file replacement)
// DELETE /api/materials/:id   – Delete a material (removes file from disk)
// ---------------------------------------------------------------------------
router.route('/:id')
  .get(
    authenticateToken,
    validateMaterialId,
    verifyMaterialOwner,
    MaterialController.getById
  )
  .put(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    handleFileUpload,            // parse optional file upload before validation
    validateUpdateMaterial,
    verifyMaterialOwner,
    MaterialController.update
  )
  .delete(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateMaterialId,
    verifyMaterialOwner,
    MaterialController.delete
  );

export default router;
