const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const coreSsoRouter = require('./routes/coreRoutes/coreSso');
const coreTestRouter = require('./routes/coreRoutes/coreTest');
const coreLogRouter = require('./routes/coreRoutes/coreLog');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');

const fileUpload = require('express-fileupload');
// create our Express app
const app = express();

// Get the app path for nginx sub-path deployment
const APP_PATH = process.env.APP_PATH || '';

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// // default options
// app.use(fileUpload());

// Here our API Routes - mount under sub-path

app.use(`${APP_PATH}/api`, coreAuthRouter);
app.use(`${APP_PATH}/api`, coreLogRouter);
app.use(`${APP_PATH}/api`, adminAuth.isValidAuthToken, coreApiRouter);
app.use(`${APP_PATH}/api`, adminAuth.isValidAuthToken, erpApiRouter);
app.use(`${APP_PATH}/download`, coreDownloadRouter);
app.use(`${APP_PATH}/public`, corePublicRouter);
app.use(APP_PATH, coreSsoRouter);
// Fallback SSO route for backward compatibility
app.use('/', coreSsoRouter);
app.use(`${APP_PATH}/api`, coreTestRouter);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
