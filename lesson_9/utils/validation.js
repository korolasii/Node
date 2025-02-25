import Joi from 'joi';

export const taskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    status: Joi.string().valid('new', 'done').optional()
});

export const idSchema = Joi.number().integer().positive();

export const statusSchema = Joi.string().valid('new', 'done').required();
