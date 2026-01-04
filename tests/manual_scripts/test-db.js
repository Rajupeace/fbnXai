const dbFile = require('./dbHelper');

const adminDB = dbFile('admin', {});

console.log('Reading admin:', adminDB.read());

const data = { ...adminDB.read(), test: 'test' };

console.log('Writing data:', data);

adminDB.write(data);

console.log('Write successful');