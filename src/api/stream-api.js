/**
 * @typedef {import('express').Router} Router
 * @typedef {import('events').EventEmitter} EventEmitter
 */

import * as axios from 'axios';
import props from '../../properties';
import HttpError from './http-error';

class StreamAPI {

  /**
   * @param {Router} router - Express router object
   * @param {EventEmitter} eventEmitter - EventEmitter from GameEvent
   */
  constructor(router, eventEmitter) {
    this.router = router;
    this.eventEmitter = eventEmitter;
    this.games = [];
  }

  listeners() {
    // listening for new games
    this.eventEmitter.on('update', g => {
      this.games = g;
    });
  }

  _hateosUrl(req, game, limit, offset) {
    const protocol = req.protocol;
    const host = `${req.get('host')}/api/streams?game=${game}`;
    const prevLimit = offset - limit;

    const previous = `${protocol}://${host}&limit=${limit}&offset=${prevLimit > 0 ? prevLimit : 0}`;
    const next = `${protocol}://${host}&limit=${limit}&offset=${offset + limit}`;

    return { next, previous: offset > 0 ? previous : undefined };
  }

  _gameFromCache(game) {
    if (!game || game.length === 0) {
      throw new HttpError(400, 'Game cannot be empty or null');
    }
    const gameResp = this.games.filter(g => {
      return g.name.trim()
        .toLowerCase()
        .includes(game.trim().toLowerCase());
    });
    if (gameResp.length === 0) {
      throw new HttpError(400, `Cannot found '${game}' not found`);
    }
    return gameResp[0].name;
  }

  _getPaginationReqValues(req) {
    if (req.query.limit === 0 || req.query.limit === '0') {
      throw new HttpError(400, 'Limit must be between 1 and 100');
    }

    // get pagination parameters or set default values
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

    if (!(limit > 0 && limit <= 100)) {
      throw new HttpError(400, 'Limit must be between 1 and 100');
    }

    return { limit, offset };
  }

  _buildStreamResp(data) {
    return {
      channel: {
        id: data.channel._id,
        name: data.channel.name,
        logo: data.channel.logo,
        status: data.channel.status,
        url: data.channel.url,
      },
      game: data.game,
      preview: data.preview.medium,
      viewers: data.viewers
    };
  }

  _buildStreamsResp(data) {
    const streamData = [];
    if (data.streams.length === 0) {
      return streamData;
    }

    data.streams.reduce((data, s) => {
      data.push(this._buildStreamResp(s));
      return data;
    }, streamData);

    return { _total: data._total, data: streamData };
  }

  endpoints() {
    this.router.get('/stream/channel/:channelName', async(req, res, next) => {
      const channel = req.params.channelName;
      if (!channel) {
        next({
          code: 400,
          message: 'Channel name cannot be empty',
          stack: new Error().stack
        });
        return;
      }

      const httpOpts = {
        headers: { 'Client-ID': props.twitch.clientId }
      };

      const streamData = await axios.get(`${props.twitch.url}/streams/${channel}`, httpOpts);
      if (!streamData.data) {
        next({
          code: 400,
          message: 'Invalid channel',
          stack: new Error().stack
        });
        return;
      }

      const resData = this._buildStreamResp(streamData.data.stream);
      res.send(resData);
    });


    this.router.get('/stream/game/:gameName', async(req, res, next) => {
      try {
        const game = this._gameFromCache(req.params.gameName);
        const { limit, offset } = this._getPaginationReqValues(req);

        const httpOpts = {
          headers: { 'Client-ID': props.twitch.clientId },
          params: { game, limit, offset }
        };

        const streams = await axios.get(`${props.twitch.url}/streams`, httpOpts);
        const streamData = this._buildStreamsResp(streams.data);
        const { next, previous } = this._hateosUrl(req, game, limit, offset);

        res.send({
          _links: {
            next,
            previous
          },
          ...streamData
        });

      } catch (err) {
        next({
          code: err.code ? err.code : 500,
          message: err.message,
          stack: err.stack
        });
      }
    });

  }

}

/**
 * Stream API main function
 *
 * - Configure listeners
 * - Configure endpoints
 *
 * @param {Router} router - Express router
 * @param {EventEmitter} eventEmitter - EventEmitter from GameEvent

 * @returns {Router} Express router
 */
const main = (router, eventEmitter) => {
  const api = new StreamAPI(router, eventEmitter);

  api.listeners();
  api.endpoints();

  return api.router;
};

export default main;
export { StreamAPI };
