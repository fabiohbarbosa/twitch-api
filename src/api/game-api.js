/**
 * @typedef {import('express').Router} Router
 * @typedef {import('events').EventEmitter} EventEmitter
 */

class GameAPI {
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

  endpoints() {
    this.router.get('/game', (req, res, next) => {
      const name = req.query.name.trim().toLowerCase();
      if (!name || name.length < 3) {
        next({
          code: 400,
          message: 'Name must be equals or greater than 2 chars',
          stack: new Error().stack
        });
        return;
      }
      const resData = this.games.filter(g => g.name.trim().toLowerCase().includes(name));
      if (resData.length === 0) {
        res.status(204).send();
        return;
      }
      res.send(resData);
    });
  }
}

/**
 * Game API main function
 *
 * - Configure listeners
 * - Configure endpoints
 *
 * @param {Router} router - Express router
 * @param {EventEmitter} eventEmitter - EventEmitter from GameEvent
 *
 * @returns {Router} Express router
 */
const main = (router, eventEmitter) => {
  const api = new GameAPI(router, eventEmitter);

  api.listeners();
  api.endpoints();

  return api.router;
};

export default main;
