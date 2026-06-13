import { Router } from 'express';

const router = Router();

// Member 1 Workspace (Courses & Materials management)
router.get('/', (req, res) => {
  res.json({ message: 'Courses list placeholder endpoint' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create course/material placeholder endpoint' });
});

export default router;
