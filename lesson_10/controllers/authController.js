import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js'; 

export const register = async (req, res) => {
    const { username, password } = req.body;

    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [username, hashedPassword]
    );

    res.status(201).json({ message: 'Регистрация успешна', user: newUser.rows[0] });
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) return res.status(400).json({ message: 'Пользователь не найден' });

    const isValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isValid) return res.status(400).json({ message: 'Неверный пароль' });

    const accessToken = generateAccessToken(user.rows[0]);
    const refreshToken = generateRefreshToken(user.rows[0]);
    res.json({ accessToken, refreshToken });
};

export const refreshToken = (req, res) => {
    const { refreshToken: refreshTokenFromRequest } = req.body;

    if (!refreshTokenFromRequest) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    const isTokenValid = refreshTokens.includes(refreshTokenFromRequest);
    if (!isTokenValid) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ userId: 1 }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Пример данных
    res.json({ accessToken: newAccessToken });
};

export const logout = (req, res) => {
    const { token } = req.body;
    const index = refreshTokens.indexOf(token);
    if (index !== -1) {
        refreshTokens.splice(index, 1);
        return res.status(200).json({ message: 'Выход выполнен' });
    }
    return res.status(400).json({ message: 'Токен не найден' });
};


const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
