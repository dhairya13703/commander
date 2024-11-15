import express from 'express';
import {
  getAllCommands,
  getCommand,
  createCommand,
  updateCommand,
  deleteCommand,
  searchCommands,
  batchCreateCommands
} from '../controllers/commandController.js';

const router = express.Router();

router.get('/', getAllCommands);
router.get('/search', searchCommands);
router.get('/:id', getCommand);
router.post('/', createCommand);
router.post('/batch', batchCreateCommands);
router.put('/:id', updateCommand);
router.delete('/:id', deleteCommand);

export { router as commandsRouter };