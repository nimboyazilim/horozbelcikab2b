import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

let conMainMssql2;

try {
  conMainMssql2 = knex({
    client: 'mssql',
    connection: {
      server: process.env.DB_HOST_MSSQL2 || 'localhost',
      port: parseInt(process.env.DB_PORT_MSSQL2 || '1433'),
      user: process.env.DB_USER_MSSQL2,
      password: process.env.DB_PASSWORD_MSSQL2,
      database: process.env.DB_NAME_MSSQL2,
      requestTimeout: 60000, // 60 saniye
      connectionTimeout: 60000, // 60 saniye
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    },
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    }
  });
  console.log('MSSQL 2 Database connection successful');
} catch (error) {
  console.error('MSSQL 2 Database connection failed:', error.message);
  
}

export default conMainMssql2;
