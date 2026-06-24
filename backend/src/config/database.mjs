import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

let conMain;

try {
  conMain = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 2,
      max: 10
    }
  });
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection failed:', error.message);
  
}

export default conMain;
