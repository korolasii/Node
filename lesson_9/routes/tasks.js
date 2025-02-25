import express from 'express';
import { getTasks, addTask, toggleTaskStatus, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTasks);
router.post('/', addTask);
router.put('/:itemId', toggleTaskStatus);
router.delete('/:itemId', deleteTask);

export default router;