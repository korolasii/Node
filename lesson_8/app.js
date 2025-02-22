import express from 'express';
import { promises as fs } from 'fs';
import Joi from 'joi';

const app = express();
const PORT = 3000;
const DATA_FILE = 'tasks.json';

app.use(express.json());

const loadTasks = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const saveTasks = async (tasks) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
};

let tasks = await loadTasks();
let idCounter = tasks.length ? Math.max(...tasks.map(i => i.id)) + 1 : 1;

const taskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    status: Joi.string().valid('new', 'done').optional()
});

const idSchema = Joi.number().integer().positive();

const statusSchema = Joi.string().valid('new', 'done').required();

app.get('/items', async (req, res) => {
    res.json(tasks);
});

app.post('/items', async (req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newTask = { id: idCounter++, title: req.body.title, status: 'new' };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json(newTask);
});

app.put('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const { error } = idSchema.validate(parseInt(itemId));
    if (error) return res.status(400).json({ error: 'Invalid ID' });

    const task = tasks.find(t => t.id === parseInt(itemId));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newStatus = task.status === 'new' ? 'done' : 'new';
    const { error: statusError } = statusSchema.validate(newStatus)
    if (statusError) return res.status(404).json({ error: 'Invalid status' })
    await saveTasks(tasks);
    res.json(task);
});

app.delete('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const { error } = idSchema.validate(parseInt(itemId));
    if (error) return res.status(400).json({ error: 'Invalid ID' });

    const index = tasks.findIndex(t => t.id === parseInt(itemId));
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    tasks.splice(index, 1);
    await saveTasks(tasks);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
