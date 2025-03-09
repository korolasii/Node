import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', 
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        await sequelize.sync({ force: false }); 
        console.log('Database synchronized');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    }
};

export { sequelize };
export default connectDB;
