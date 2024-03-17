const mongoose = require('mongoose');

mongoose.connection.on('connected', async () => {
    console.log('MongoDb connected');
});

mongoose.connection.on('error', async (err) => {
    console.log('Error connecting MongoDb', err);
});

const connection = mongoose.connect('mongodb://0.0.0.0:27017/my_dbs');


module.exports = connection