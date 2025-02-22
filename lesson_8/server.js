import express from 'express';
import taskRoutes from './routes/tasks.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/items', taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});