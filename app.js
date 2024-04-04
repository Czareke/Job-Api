const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const userRouter = require('./routes/userRoutes');
const jobRouter = require('./routes/jobRoutes');
const globalErrorHandler = require('./controllers/errorCOntroller');

const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); //it helps secure express apps by setting it to the res header
const mongoSanitize = require('express-mongo-sanitize'); //prevents hacking of the db
const xss = require('xss-clean');
const hpp = require('hpp'); //express middleware to protect against http parameter pollution attacks
const cookieParser = require('cookie-parser');
const cors = require('cors');
// swagger

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(bodyParser.json());
// app.enable('trust proxy');
// secure http headers
app.use(helmet());
// implement curs
app.use(cors());
// access-control-allow-origin
app.options('*', cors());
// Development logging
app.use(morgan('dev'));

// limit req from some ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this Ip address,Try again after an hour',
});
app.use('/api', limiter);
// data sanitation against noSQL,Query injection
app.use(mongoSanitize());
app.use(hpp());
//routes
app.get('/', (req, res) => {
  res.send("<h1>Wiki Api</h1><<a href='/api-docs'>Documentation</a>");
});
app.use('/api/vi/user', userRouter);
app.use('/api/vi/job', jobRouter);
module.exports = app;
