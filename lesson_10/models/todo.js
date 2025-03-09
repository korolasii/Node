import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Todo = sequelize.define('Todo', {
    title: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
    },
});

const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false });  
        console.log('Database synced');
    } catch (err) {
        console.error('Error syncing database:', err);
    }
};

syncDatabase();

export default Todo;
