const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorhandler = require('errorhandler');

morgan('dev');
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, function() {
  console.log('Server is running');
});

module.exports = app;
