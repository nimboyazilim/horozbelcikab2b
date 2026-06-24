import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

let conMainMssql;

try {
  conMainMssql = knex({
    client: 'mssql',
    connection: {
      server: process.env.DB_HOST_MSSQL || 'localhost',
      port: parseInt(process.env.DB_PORT_MSSQL || '1433'),
      user: process.env.DB_USER_MSSQL,
      password: process.env.DB_PASSWORD_MSSQL,
      database: process.env.DB_NAME_MSSQL,
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    }
  });
  console.log('MSSQL Database connection successful');
} catch (error) {
  console.error('MSSQL Database connection failed:', error.message);
  
}

export default conMainMssql;
