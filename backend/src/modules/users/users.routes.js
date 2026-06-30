import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { authenticateToken } from '../../config/auth.js';

const router = Router();

// Apply auth middleware to all CRUD endpoints
router.use(authenticateToken);

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ error: 'Internal server error fetching users list.' });
  }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch User Detail Error:', error);
    res.status(500).json({ error: 'Internal server error fetching user.' });
  }
});

// UPDATE USER BY ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check email uniqueness if email is changed
    if (email && email !== userExists.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email }
      });
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ error: 'Invalid user role.' });
      }
      updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: 'Internal server error updating user.' });
  }
});

// DELETE USER BY ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check user exists
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ error: 'Internal server error deleting user.' });
  }
});

export default router;
