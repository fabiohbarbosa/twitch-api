import express from 'express';
import morgan from 'morgan';

import Log from '../config/logger';
import props from '../properties';

import gameEventProcess from './event/game-event';

import healthcheck from './api/healthcheck-api';
import game from './api/game-api';
import stream from './api/stream-api';

import errorHandler from './middleware/error-handler';

// load event to fetch games
const gameEvent = gameEventProcess();

// initialize the express server
const app = express();
const router = express.Router();

// attach request/response morgan logger
app.use(morgan('combined', {
  skip: req => req.url.indexOf('/healthcheck') !== -1
}));

// disable express default headers
app.disable('x-powered-by');

app.use('/', healthcheck(router));
app.use('/v1', game(router, gameEvent));
app.use('/v1', stream(router, gameEvent));

// wrong routes should be return 404 status code
app.use('*', (req, res) => res.status(404).send());

// global error handler
app.use(errorHandler);

// start accepting connections
const port = props.port;
app.listen(port);
Log.info(`Twitch API now listening on ${port}`);
