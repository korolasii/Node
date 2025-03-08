import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import sequelize from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || process.env.DB_PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: `${process.env.DB_HOST}:${process.env.DB_PORT}` }));

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

sequelize.sync({ force: false }) 
    .then(() => {
        console.log('Database connected and tables created');
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
    });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
