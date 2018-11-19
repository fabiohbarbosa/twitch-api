import { GameEvent } from '../../src/event/game-event';

import { assert } from 'chai';
import * as sinon from 'sinon';
import { EventEmitter } from 'events';

describe('GameEvent specs', () => {

  let event;
  beforeEach(() => {
    event = new GameEvent();
  });

  // ~-- _queueCallback
  describe('_queueCallback', () => {

    it('should not emit event for 400 HTTP status because total games should have changed', () => {
      const eventEmitter = new EventEmitter();
      const mock = sinon.stub(eventEmitter, 'emit');

      const event = new GameEvent(eventEmitter);

      const err = { status: 400 };
      const url = 'http://localhost/unit_test';

      event._queueCallback(err, undefined, false, url);

      assert.isFalse(mock.withArgs('change').calledOnce);
      assert.isFalse(mock.withArgs('update').calledOnce);
    });

    it('should index games and emit change event when queue tasks does not finished', () => {
      const eventEmitter = new EventEmitter();
      const mock = sinon.stub(eventEmitter, 'emit');

      const event = new GameEvent(eventEmitter);

      const games = [];
      const url = 'http://localhost/unit_test';

      event._queueCallback(undefined, games, false, url);

      assert.isTrue(mock.withArgs('change').calledOnce);
      assert.isFalse(mock.withArgs('update').calledOnce);
    });

    it('should index games and emit change and update events when queue tasks finished', () => {
      const eventEmitter = new EventEmitter();
      const mock = sinon.stub(eventEmitter, 'emit');

      const event = new GameEvent(eventEmitter);

      const games = [];
      const url = 'http://localhost/unit_test';

      event._queueCallback(undefined, games, true, url);

      assert.isTrue(mock.withArgs('change').calledOnce);
      assert.isTrue(mock.withArgs('update').calledOnce);
    });

    it('should not emit events when twitch throws an exception different than bad request', () => {
      const eventEmitter = new EventEmitter();
      const mock = sinon.stub(eventEmitter, 'emit');

      const event = new GameEvent(eventEmitter);

      const err = { status: 500 };
      const url = 'http://localhost/unit_test';

      event._queueCallback(err, undefined, false, url);

      assert.isFalse(mock.withArgs('change').calledOnce);
      assert.isFalse(mock.withArgs('update').calledOnce);
    });

    it('should emit update event when twitch throws an exception and it is the last queue task', () => {
      const eventEmitter = new EventEmitter();
      const mock = sinon.stub(eventEmitter, 'emit');

      const event = new GameEvent(eventEmitter);

      const err = { status: 500 };
      const url = 'http://localhost/unit_test';

      event._queueCallback(err, undefined, true, url);

      assert.isFalse(mock.withArgs('change').calledOnce);
      assert.isTrue(mock.withArgs('update').calledOnce);
    });

  });

  // ~-- _getNextRequestsUrls
  describe('_getNextRequestsUrls', () => {

    it('should generate 9 urls for 999 entries', () => {
      const nextRequestUrls = event._getNextRequestsUrls(999);
      assert.equal(nextRequestUrls.length, 9);
    });

    it('should generate 10 urls for 1001 entries', () => {
      const nextRequestUrls = event._getNextRequestsUrls(1001);
      assert.equal(nextRequestUrls.length, 10);
    });

    it('should generate 19 urls for 1925 entries', () => {
      const nextRequestUrls = event._getNextRequestsUrls(1925);
      assert.equal(nextRequestUrls.length, 19);
    });

    it('should generate 1 url for entry one more than limit', () => {
      const nextRequestUrls = event._getNextRequestsUrls(101);
      assert.equal(nextRequestUrls.length, 1);
    });

    it('should not generate url for total less than limit', () => {
      const nextRequestUrls = event._getNextRequestsUrls(1);
      assert.isEmpty(nextRequestUrls);
    });

    it('should not generate url total equals than limit', () => {
      const nextRequestUrls = event._getNextRequestsUrls(100);
      assert.isEmpty(nextRequestUrls);
    });

  });

  // ~-- _indexData
  describe('_indexData', () => {

    it('should reduce real data from twitch API', () => {
      const games = require('./games.json').top;
      event._indexData(games);

      assert.equal(event.gamesIndexToSwap.lenght, games.lenght);
    });

    it('should keep swap object empty for empty data', () => {
      event._indexData([]);
      assert.isEmpty(event.gamesIndexToSwap);
    });

  });

});
