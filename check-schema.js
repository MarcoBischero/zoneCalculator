const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'zonecalculator'
    });

    try {
        const [rows] = await connection.execute('DESCRIBE risorse');
        console.log('Table structure for risorse:');
        console.table(rows);

        const [userData] = await connection.execute('SELECT id, mode, username FROM risorse LIMIT 5');
        console.log('\nSample user data:');
        console.table(userData);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkSchema();
