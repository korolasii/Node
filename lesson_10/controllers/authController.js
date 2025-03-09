import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const generateToken = (user, expiresIn) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn });
};

export const register = async (req, res) => {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const emailPrefix = email.split('@')[0];
    if (password.includes(emailPrefix)) {
        return res.status(400).json({ message: 'Password cannot contain part of the email before "@"' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });

    const token = generateToken(user, '1w');
    res.status(201).json({ token });
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user, '15m');
    res.json({ token });
};

export const logout = (req, res) => {
    res.json({ message: 'Logged out' });
};

export const protect = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        req.user = decoded;
        next();
    });
};
