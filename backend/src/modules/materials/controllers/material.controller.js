import { MaterialService } from '../services/material.service.js';

export class MaterialController {
  /**
   * Handles creating a new material.
   * Supports both multipart/form-data (file upload) and JSON bodies.
   */
  static async create(req, res, next) {
    try {
      const {
        sectionId,
        title,
        description,
        type,
        contentUrl,
        embedCode,
        isGraded,
        gradingWeight
      } = req.body;

      const material = await MaterialService.createMaterial({
        sectionId,
        title,
        description,
        type,
        contentUrl,
        embedCode,
        isGraded,
        gradingWeight,
        file: req.file   // populated by Multer when a file is uploaded
      });

      return res.status(201).json(material);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving all materials belonging to a specific section (module).
   */
  static async getBySection(req, res, next) {
    try {
      const { sectionId } = req.params;
      const materials = await MaterialService.getMaterialsBySection(sectionId);
      return res.status(200).json(materials);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving a single material by its ID.
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const material = await MaterialService.getMaterialById(id);
      return res.status(200).json(material);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a material by its ID.
   * Supports optional file replacement via multipart/form-data.
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        type,
        contentUrl,
        embedCode,
        isGraded,
        gradingWeight
      } = req.body;

      const material = await MaterialService.updateMaterial(id, {
        title,
        description,
        type,
        contentUrl,
        embedCode,
        isGraded,
        gradingWeight,
        file: req.file   // undefined when no new file is uploaded
      });

      return res.status(200).json(material);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a material by its ID.
   * Also removes any associated uploaded file from disk.
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await MaterialService.deleteMaterial(id);
      return res.status(200).json({ message: 'Material deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
