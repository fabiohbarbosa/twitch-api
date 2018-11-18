import * as axios from 'axios';
import props from '../../properties';

export default router => {
  router.get('/streams', (req, res, next) => {
    const game = req.query.game;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    if (!(limit > 0 && limit <= 100)) {
      res.status(400).json({ message: 'Limit should be between 1 and 100' });
      return;
    }

    const options = {
      headers: { 'Client-ID': props.twitch.clientId },
      params: { game, limit, offset }
    };

    axios.get(`${props.twitch.url}/streams`, options).then(response => {
      const { preview, channel } = response.data.streams[0];

      // get channel and fill in iframe

      const prePrevious = `${req.fullUrl}?limit=${limit}&offset=${offset}`;
      const previous = game ? `${prePrevious}&game=${game}` : prePrevious;

      const preNext = `${req.fullUrl}?limit=${limit}&offset=${offset + limit}`;
      const next = game ? `${preNext}&game=${game}` : preNext;

      res.send({
        _links: {
          next,
          previous: offset > 0 ? previous : undefined
        }
      });
    }).catch(err => next(err));
  });
  return router;
};
