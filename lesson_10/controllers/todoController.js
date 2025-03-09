import Todo from '../models/todo.js';

export const createTodo = async (req, res) => {
    try {
        const { title} = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const todo = await Todo.create({
            title,
            active: true, 
            userId: req.user.id,  
        });

        res.status(201).json(todo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getTodos = async (req, res) => {
    const todos = await Todo.findAll({ where: { userId: req.user.id } });
    res.json(todos);
};

export const updateTodo = async (req, res) => {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);

    if (!todo || todo.userId !== req.user.id) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    todo.title = req.body.title || todo.title;
    todo.completed = req.body.completed !== undefined ? req.body.completed : todo.completed;
    await todo.save();
    res.json(todo);
};

export const deleteTodo = async (req, res) => {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);

    if (!todo || todo.userId !== req.user.id) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    await todo.destroy();
    res.json({ message: 'Todo removed' });
};
