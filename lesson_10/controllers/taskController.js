import pool from '../db.js'; 

export const getTasks = async (req, res) => {
    const { userId } = req.user; 
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    res.json(result.rows);
};

export const addTask = async (req, res) => {
    const { title } = req.body;
    const { userId } = req.user; 

    const newTask = await pool.query(
        'INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *',
        [title, userId]
    );
    res.status(201).json(newTask.rows[0]);
};

export const toggleTaskStatus = async (req, res) => {
    const { itemId } = req.params;
    const { userId } = req.user;

    const task = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [itemId, userId]);
    if (task.rows.length === 0) return res.status(404).json({ error: 'Задача не найдена' });

    const updatedStatus = task.rows[0].status === 'new' ? 'done' : 'new';
    const updatedTask = await pool.query(
        'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
        [updatedStatus, itemId]
    );
    res.json(updatedTask.rows[0]);
};

export const deleteTask = async (req, res) => {
    const { itemId } = req.params;
    const { userId } = req.user; 

    const task = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [itemId, userId]);
    if (task.rows.length === 0) return res.status(404).json({ error: 'Задача не найдена' });

    await pool.query('DELETE FROM tasks WHERE id = $1', [itemId]);
    res.status(204).send();
};
