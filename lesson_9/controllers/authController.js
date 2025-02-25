import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const users = [];
let refreshTokens = [];

export const register = async (req, res) => {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, username, password: hashedPassword };
    users.push(user);

    res.status(201).json({ message: 'Регистрация успешна' });
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (!user) return res.status(400).json({ message: 'Пользователь не найден' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Неверный пароль' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
};

export const refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token || !refreshTokens.includes(token)) {
        return res.status(403).json({ message: 'Недействительный Refresh Token' });
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Ошибка проверки токена' });

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    });
};

export const logout = (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.status(200).json({ message: 'Выход выполнен' });
};

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_LIFETIME }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_LIFETIME }
    );
};
