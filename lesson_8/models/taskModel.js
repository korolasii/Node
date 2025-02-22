import { promises as fs } from 'fs';
const DATA_FILE = 'tasks.json';

export const loadTasks = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        console.log(data)
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

export const saveTasks = async (tasks) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
};