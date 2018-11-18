import Log from '../../config/logger';

export default (err, req, res, next) => {
  Log.error(err.stack ? err.stack : new Error().stack);

	res.status(err.code ? err.code : 500).send({
    message: err.message ? err.message : 'UNKNOWN_SERVER_ERROR'
	});
	next();
};
