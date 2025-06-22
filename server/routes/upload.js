import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logUserActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload profile image
router.post('/users/:id/upload-image', upload.single('profile_image'), (req, res) => {
  const { id } = req.params;
  const { db } = req.app.locals;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Generate URL for the uploaded file
  const imageUrl = `/uploads/profile-images/${req.file.filename}`;

  // Update user's profile image in database
  db.run('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, id], function(err) {
    if (err) {
      // Delete the uploaded file if database update fails
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Database update failed' });
    }

    logUserActivity(db, req.user.id, 'update', 'Updated profile image', null, req);

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl
    });
  });
});

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

export default router;