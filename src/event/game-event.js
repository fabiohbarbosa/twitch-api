/**
 * @typedef {import('express').Router} Router
 */

import { scheduleJob } from 'node-schedule';
import { EventEmitter } from 'events';

import * as _ from 'lodash';
import * as axios from 'axios';
import async from 'async';

import props from '../../properties';
import Log from '../../config/logger';

class GameEvent {

  /**
   *
   * @param {EventEmitter} event
   */
  constructor(event) {
    this.semaphore = false;
    this.event = event;
    this.url = `${props.twitch.url}/games/top`;
    this.limit = 100;
    this.options = {
      headers: { 'Client-ID': props.twitch.clientId },
    };
    this.queue = this._queue();
    this.gamesIndexToSwap = [];
  }

  _queue() {
    /**
     * Queue executor
     *
     * @param {string} url - URL used to make an API request.
     * @param {queueCallback} callback - A callback to run.
     */
    const queue = async.queue((url, callback) => {
      callback.bind(this);
      Log.debug(`Fetching games from ${url}`);
      Log.debug(`Waiting to be processed ${queue.length()}`);
      Log.debug('-------------------------------');

      axios.get(url, this.options)
        .then(res => {
          callback(null, res.data.top, queue.workersList().length === 1, url);
        })
        .catch(err => {
          try {
            const errObj = JSON.parse(err.response.data.message);
            callback(errObj, null, queue.workersList().length === 1, url);
          } catch (err) {
            throw err;
          }
        });
    }, 10);

    return queue;
  }

  /**
   * Callback for fetch games queue execution.
   *
   * @callback queueCallback
   * @param {string} err - Error message.
   * @param {object} games - Games fetch from twitch.
   * @param {boolean} finished - It was the last task execution.
   * @param {string} url - URL used to make an API request.
   */
  _queueCallback(err, games, finished, url) {
    if (err && err.status === 400) {
      Log.warn(`Cannot process request: ${url}, total games should have changed`);
    } else if (err) {
      Log.error(`Error to process request: ${url} - message: ${JSON.stringify(err)}`);
    } else {
      this._indexData(games);
      this.event.emit('change');
      Log.info(`Success to process request: ${url}`);
    }

    if (finished) {
      Log.info(`Received ${this.gamesIndexToSwap.length} games from twitch`);
      const comparable = (v1, v2) => {
        if (v1.popularity > v2.popularity) return -1;
        if (v1.popularity < v2.popularity) return 1;
        return 0;
      };

      // clone array and remove duplicated
      const newGames = Array.from(this.gamesIndexToSwap.sort(comparable));
      this.event.emit('update', _.uniqBy(newGames, g => g.id));

      this.semaphore = false;
    }
  }

  /**
   * Generate all URLs to request the games from twitch's pageable API.
   *
   * @param {string} totalGames - Total games in twitch.
   * @returns {arrays} URLs to fetch games.
   */
  _getNextRequestsUrls(totalGames) {
    Log.info(`There are ${totalGames} games in Twitch`);
    const numRequests = Math.ceil(totalGames / this.limit);
    const nextRequestUrls = [];

    let offset = this.limit;
    for (let i = 0; i < numRequests - 1; i++) {
      nextRequestUrls.push(`${this.url}?limit=${this.limit}&offset=${offset}`);
      offset += this.limit;
    }
    return nextRequestUrls;
  };

  /**
   * Index games into the swap object
   * @param {array} games - An array of games.
   */
  _indexData(games) {
    const gamesToIndex = games.map(g => ({
      id: g.game._id,
      name: g.game.name,
      popularity: g.game.popularity
    }));

    this.gamesIndexToSwap = this.gamesIndexToSwap.concat(gamesToIndex);
  }

  /**
   * Process all games' requests
   */
  async _process() {
    try {
      // skip execution if scheduler has been running
      if (this.semaphore === true) {
        Log.warn('There is another schedule cycle fetching games. Skipping...');
        return;
      }

      // clean games to swap
      this.gamesIndexToSwap = [];
      this.semaphore = true;
      this.event.emit('start');

      const url = `${this.url}?limit=${this.limit}`;

      // the first request to get the total
      Log.info(`Fetching games from ${url}`);
      const res = await axios.get(url, this.options);

      const totalGames = res.data._total;
      const games = res.data.top;

      const callback = this._queueCallback.bind(this);

      callback(null, games, false, url);
      const nextRequestsUrls = this._getNextRequestsUrls(totalGames);

      // add last request to front of queue, because the games size changes all the time
      this.queue.unshift(nextRequestsUrls.pop(), callback);

      // add the others request's url
      this.queue.push(nextRequestsUrls, callback);
    } catch (err) {
      throw err.stack;
    }
  }

  /**
   * Start scheduler tasks and run the first one request on startup.
   */
  start() {
    this._process().catch((err) => Log.error(err));
    scheduleJob(props.schedule.gameCron, () => {
      this._process().catch((err) => Log.error(err));
    });
  }
}

/**
 * Available event message:
 * - start: When the new cycle starts.
 * - change: When the cycle is running.
 * - update: When the cycle finished. The new object will be send as an argument.
 *
 * @returns {EventEmitter} Game event
 */
const main = () => {
  const event = new EventEmitter();
  new GameEvent(event).start();
  return event;
};

export default main;
export { GameEvent };
