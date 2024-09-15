const mongoose = require('mongoose');

const USER_NAME = 'Anoushka';
const PASSWORD = '12345';
const DB_NAME = 'merndb';
const DB_URI = `mongodb+srv://${USER_NAME}:${PASSWORD}@merncluster.gtl2u.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=MernCluster`;

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;