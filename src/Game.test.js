import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import Septikon from './Game';

const matchID = 'sputnik';
const client0 = Client({
  game: Septikon, playerID: '0', multiplayer: Local(), matchID,
});
client0.start();
const client1 = Client({
  game: Septikon, playerID: '1', multiplayer: Local(), matchID,
});
client1.start();

test('player 0: place clones', () => {
  client0.moves.clickCell(0, '0');
  client0.moves.clickCell(0, '0');
  client0.moves.clickCell(164, '0');
  client0.moves.clickCell(147, '0');
  client0.moves.clickCell(136, '0');
  client0.moves.clickCell(30, '0');
  client0.moves.clickCell(14, '0');
  const { G: g0 } = client0.store.getState();

  expect(g0.players[0].clones).toEqual([
    {
      x: 7, y: 17, spy: false, gunner: false,
    },
    {
      x: 7, y: 0, spy: false, gunner: false,
    },
    {
      x: 6, y: 10, spy: false, gunner: false,
    },
    {
      x: 1, y: 9, spy: false, gunner: false,
    },
    {
      x: 0, y: 14, spy: false, gunner: false,
    },
  ]);
});

test('player 0: ready to start', () => {
  client0.moves.confirmSetup('0');
  const { G: g0, ctx: c0 } = client0.store.getState();
  expect(g0.setupConfirmations).toEqual([true, false]);
  expect(c0.currentPlayer).toEqual('1');
});

test('states should match', () => {
  const { G: g0 } = client0.store.getState();
  const { G: g1, ctx: c1 } = client1.store.getState();
  const { setupConfirmations: gsc0 } = g0;
  const { setupConfirmations: gsc1 } = g1;
  expect(gsc0).toEqual(gsc1);
  expect(c1.currentPlayer).toEqual('1');
});

test('player 1: place clones', () => {
  client1.moves.clickCell(650, '1');
  client1.moves.clickCell(649, '1');
  client1.moves.clickCell(648, '1');
  client1.moves.clickCell(647, '1');
  client1.moves.clickCell(646, '1');
  const { G: g1 } = client1.store.getState();

  expect(g1.players[1].clones).toEqual([
    {
      x: 30, y: 20, spy: false, gunner: false,
    },
    {
      x: 30, y: 19, spy: false, gunner: false,
    },
    {
      x: 30, y: 18, spy: false, gunner: false,
    },
    {
      x: 30, y: 17, spy: false, gunner: false,
    },
    {
      x: 30, y: 16, spy: false, gunner: false,
    },
  ]);
});

test('player 1: ready to start', () => {
  client1.moves.confirmSetup('1');
  const { G: g1, ctx: c1 } = client1.store.getState();
  expect(g1.setupConfirmations).toEqual([true, true]);
  expect(c1.currentPlayer).toEqual('0');
});

test('player 0: roll a five', () => {
  client0.moves.rollDie();
  const { G: g0 } = client0.store.getState();
  expect(g0.rollValue).toEqual(5);
});

test('player 0: verify clone move options', () => {
  client0.moves.clickCell(147, '0');
  const { G: g0 } = client0.store.getState();
  // console.log(g0.stagedCells);
  expect(g0.stagedCells).toEqual([
    { x: 1, y: 6 },
    { x: 5, y: 10 },
    { x: 1, y: 14 },
    { x: 6, y: 7 },
    { x: 6, y: 13 },
    { x: 1, y: 10 },
    { x: 7, y: 16 },
    { x: 8, y: 17 },
    { x: 6, y: 17 },
    { x: 8, y: 4 },
    { x: 7, y: 5 },
    { x: 6, y: 4 },
  ]);
});

test('player 0: roll & move onto surface', () => { });
test('player 1: move onto production tile', () => {
  // TODO: click a clone
  // TODO: move to a production tile
  // TODO: check for resource swap
});
test('player 0: move onto battle tile', () => { });
test('player 0: select gunner', () => { });
test('player 0: fire laser and verify damage/cost', () => { });
test('player 1: move through lock', () => { });
test('player 1: test clone movement near damage', () => { });
test('player 0: fire rocket', () => { });
test('player 1: arm clones (and move rocket)', () => { });
test('player 0: fire thermite (and move rocket)', () => { });
test('player 1: repair tile', () => { });
test('player 0: fire biodrone', () => { });
