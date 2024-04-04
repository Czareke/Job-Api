const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();
const http = require('http');

const DB = process.env.MONGO_URL;
mongoose.connect(DB).then(() => {
  console.log('::connected to mongoDB::');
});

// server is setup
const port = process.env.PORT || 9000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
