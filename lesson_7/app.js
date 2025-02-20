import express from 'express';
import { promises as fs } from 'fs';

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
let idCounter = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

app.get('/items', async (req, res) => {
    res.json(tasks);
});

app.post('/items', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    const newTask = { id: idCounter++, title, status: 'new' };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json(newTask);
});

app.put('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const task = tasks.find(t => t.id === parseInt(itemId));
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    task.status = task.status === 'new' ? 'done' : 'new';
    await saveTasks(tasks);
    res.json(task);
});

app.delete('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const index = tasks.findIndex(t => t.id === parseInt(itemId));
    if (index === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    tasks.splice(index, 1);
    await saveTasks(tasks);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
