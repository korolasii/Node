import { loadTasks, saveTasks } from '../models/taskModel.js';
import { taskSchema, idSchema, statusSchema } from '../utils/validation.js';

let tasks = await loadTasks();
let idCounter = tasks.length ? Math.max(...tasks.map(i => i.id)) + 1 : 1;

export const getTasks = async (req, res) => {
    res.json(tasks);
};

export const addTask = async (req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newTask = { id: idCounter++, title: req.body.title, status: 'new' };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json(newTask);
};

export const toggleTaskStatus = async (req, res) => {
    const { itemId } = req.params;
    const { error } = idSchema.validate(parseInt(itemId));
    if (error) return res.status(400).json({ error: 'Invalid ID' });

    const task = tasks.find(t => t.id === parseInt(itemId));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = task.status === 'new' ? 'done' : 'new';
    const { error: statusError } = statusSchema.validate(task.status);
    if (statusError) return res.status(404).json({ error: 'Invalid status' });

    await saveTasks(tasks);
    res.json(task);
};

export const deleteTask = async (req, res) => {
    const { itemId } = req.params;
    const { error } = idSchema.validate(parseInt(itemId));
    if (error) return res.status(400).json({ error: 'Invalid ID' });

    const index = tasks.findIndex(t => t.id === parseInt(itemId));
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    tasks.splice(index, 1);
    await saveTasks(tasks);
    res.status(204).send();
};