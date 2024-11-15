// backend/src/routes/folders.js
import express from 'express';
import {
  createMainFolder,
  getMainFolders,
  getMainFolder,
  updateMainFolder,
  deleteMainFolder,
  createSubFolder,
  getSubFolders,
  getSubFolder,
  updateSubFolder,
  deleteSubFolder
} from '../controllers/folderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Main folder routes
router.post('/main', authenticate, createMainFolder);
router.get('/main', authenticate, getMainFolders);
router.get('/main/:id', authenticate, getMainFolder);
router.put('/main/:id', authenticate, updateMainFolder);
router.delete('/main/:id', authenticate, deleteMainFolder);

// Sub folder routes
router.post('/sub', authenticate, createSubFolder);
router.get('/sub/:mainFolderId', authenticate, getSubFolders);
router.get('/sub/single/:id', authenticate, getSubFolder);
router.put('/sub/:id', authenticate, updateSubFolder);
router.delete('/sub/:id', authenticate, deleteSubFolder);

export { router as folderRouter };