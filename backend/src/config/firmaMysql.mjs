import knex from 'knex';


// MySQL bağlantısını oluşturan fonksiyon
export const createMysqlConnection = (dbCredentials) => {
    const { f_local_db_host, f_local_db_user, f_local_db_password, f_local_db_name } = dbCredentials;
    
    try {
        const connection = knex({
            client: 'mysql2',
            connection: {
                host: f_local_db_host,
                user: f_local_db_user,
                password: f_local_db_password,
                database: f_local_db_name   
            },
            pool: {
                min: 0,
                max: 7
            }
        });
        
        console.log('MySQL bağlantısı başarıyla oluşturuldu');
        return connection;
    } catch (error) {
        console.error('MySQL bağlantısı oluşturulurken hata:', error);
        throw error;
    }
};
