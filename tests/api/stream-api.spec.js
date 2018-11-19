import { StreamAPI } from '../../src/api/stream-api';
import HttpError from '../../src/api/http-error';

import { assert } from 'chai';
import * as sinon from 'sinon';
import { EventEmitter } from 'events';

describe('StreamAPI specs', () => {

  // ~-- listeners
  describe('listeners', () => {

    it('should update all games in listener', () => {
      const eventEmitter = new EventEmitter();
      const games = [
        { name: 'Dota 2' },
        { name: 'Call of Duty' }
      ];

      sinon.stub(eventEmitter, 'on')
        .withArgs('update')
        .yields(games);

      const api = new StreamAPI(undefined, eventEmitter);

      api.listeners();
      assert.equal(api.games, games);
    });

  });

  // ~-- _hateosUrl
  describe('_hateosUrl', () => {
    const api = new StreamAPI(undefined, undefined);

    it('should make only next URL for the first page', () => {
      const req = {
        protocol: 'http',
        get: () => 'localhost'
      };
      const game = 'Dota 2';
      const limit = 5;
      const offset = 0;

      const { next, previous } = api._hateosUrl(req, game, limit, offset);

      assert.equal(next, `http://localhost/api/streams?game=${game}&limit=5&offset=5`);
      assert.isUndefined(previous);
    });

    it('should make previous and next URL for a page different than first one', () => {
      const req = {
        protocol: 'http',
        get: () => 'localhost'
      };
      const game = 'Dota 2';
      const limit = 10;
      const offset = 20;

      const { next, previous } = api._hateosUrl(req, game, limit, offset);

      assert.equal(previous, `http://localhost/api/streams?game=${game}&limit=10&offset=10`);
      assert.equal(next, `http://localhost/api/streams?game=${game}&limit=10&offset=30`);
    });

  });

  // ~-- _gameFromCache
  describe('_gameFromCache', () => {

    let api;
    let games;

    beforeEach(() => {
      api = new StreamAPI(undefined, undefined);
      games = [
        { name: 'Dota 2' },
        { name: 'Call of Duty' }
      ];
      api.games = games;
    });

    it('should find an uppercase text', () => {
      const game = 'DOTA 2';
      const resp = api._gameFromCache(game);

      assert.equal(resp, 'Dota 2');
    });

    it('should find a lowercase text', () => {
      const game = 'dota 2';
      const resp = api._gameFromCache(game);

      assert.equal(resp, 'Dota 2');
    });

    it('should find a text with spaces around', () => {
      const game = ' Call of Duty ';
      const resp = api._gameFromCache(game);

      assert.equal(resp, 'Call of Duty');
    });

    it('should throw expection for an undefined game', () => {
      assert.throws(() => {
        api._gameFromCache(undefined);
      }, HttpError);
    });

    it('should throw expection for an empty game', () => {
      assert.throws(() => {
        api._gameFromCache('');
      }, HttpError);
    });

    it('should throw expection for a null game', () => {
      assert.throws(() => {
        api._gameFromCache(null);
      }, HttpError);
    });

  });

  // ~-- _getPaginationReqValues
  describe('_getPaginationReqValues', () => {

    let api;

    beforeEach(() => {
      api = new StreamAPI(undefined, undefined);
    });

    it('should convert string args to number', () => {
      const req = {
        query: {
          limit: '10',
          offset: '10'
        }
      };
      const { limit, offset } = api._getPaginationReqValues(req);

      assert.typeOf(limit, 'number');
      assert.typeOf(offset, 'number');
    });

    it('should convert number args to number', () => {
      const req = {
        query: {
          limit: 10,
          offset: 10
        }
      };
      const { limit, offset } = api._getPaginationReqValues(req);

      assert.typeOf(limit, 'number');
      assert.typeOf(offset, 'number');
    });

    it('should throw exception when limit is greater than 100', () => {
      const req = {
        query: {
          limit: 101
        }
      };

      assert.throws(() => {
        api._getPaginationReqValues(req);
      }, HttpError);
    });

    it('should throw exception when limit is less than 0', () => {
      const req = {
        query: {
          limit: -1
        }
      };

      assert.throws(() => {
        api._getPaginationReqValues(req);
      }, HttpError);
    });

    it('should throw exception when limit is 0', () => {
      const req = {
        query: {
          limit: 0
        }
      };

      assert.throws(() => {
        api._getPaginationReqValues(req);
      }, HttpError);
    });

  });

  // ~-- _getPaginationReqValues
  describe('_getPaginationReqValues', () => {

    let api;

    beforeEach(() => {
      api = new StreamAPI(undefined, undefined);
    });

    it('should reduce data coming from twitch API', () => {
      const data = require('./streams.json');

      const streamData = api._buildStreamResp(data);

      assert.equal(data._total, streamData._total);
      assert.equal(streamData.lenght, data.lenght);
    });

  });


});
