import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import Septikon from './Game';
import ResourceHelper from './helpers/resourceHelper';

describe('basic game runthrough', () => {
  const matchID = 'snowbear';
  const client0 = Client({
    game: Septikon, playerID: '0', multiplayer: Local(), matchID,
  });
  client0.start();
  const client1 = Client({
    game: Septikon, playerID: '1', multiplayer: Local(), matchID,
  });
  client1.start();

  test('player 0: place clones', () => {
    client0.moves.placeClone(0, '0');
    client0.moves.placeClone(0, '0');
    client0.moves.placeClone(164, '0');
    client0.moves.placeClone(147, '0');
    client0.moves.placeClone(136, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    const { G: g0 } = client0.store.getState();

    expect(g0.players[0].clones).toEqual([
      {
        owner: '0', x: 7, y: 17, spy: false, gunner: false, arms: [],
      },
      {
        owner: '0', x: 7, y: 0, spy: false, gunner: false, arms: [],
      },
      {
        owner: '0', x: 6, y: 10, spy: false, gunner: false, arms: [],
      },
      {
        owner: '0', x: 1, y: 9, spy: false, gunner: false, arms: [],
      },
      {
        owner: '0', x: 0, y: 14, spy: false, gunner: false, arms: [],
      },
    ]);
    expect(g0.cells[164].occupied).toEqual(true);
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
    client1.moves.placeClone(650, '1');
    client1.moves.placeClone(649, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(485, '1');
    const { G: g1 } = client1.store.getState();

    expect(g1.players[1].clones).toEqual([
      {
        owner: '1', x: 30, y: 20, spy: false, gunner: false, arms: [],
      },
      {
        owner: '1', x: 30, y: 19, spy: false, gunner: false, arms: [],
      },
      {
        owner: '1', x: 30, y: 18, spy: false, gunner: false, arms: [],
      },
      {
        owner: '1', x: 30, y: 17, spy: false, gunner: false, arms: [],
      },
      {
        owner: '1', x: 23, y: 2, spy: false, gunner: false, arms: [],
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
    client0.moves.selectClone(147, '0');
    const { G: g0 } = client0.store.getState();
    expect(g0.stagedModuleOptions).toEqual([
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

  test('player 0: move onto surface', () => {
    client0.moves.selectCloneMoveTarget(172, '0');
    const { G: g0, ctx: c0 } = client0.store.getState();
    expect(g0.cells[147].occupied).toEqual(false);
    expect(g0.cells[172].occupied).toEqual(true);
    // check that clone is now at 172
    expect(g0.players[0].clones[1].x).toEqual(8);
    expect(g0.players[0].clones[1].y).toEqual(4);
    // check that clone is now a gunner
    expect(g0.players[0].clones[1].gunner).toEqual(true);
    // check that game advances to player 1's turn
    expect(c0.currentPlayer).toEqual('1');
  });

  test('player 1: move onto production tile', () => {
    client1.moves.rollDie(); // 4

    // click a clone
    client1.moves.selectClone(647, '1');

    // move to a production tile
    client1.moves.selectCloneMoveTarget(643, '1');
    const { G: g1, ctx: c1 } = client1.store.getState();

    expect(g1.players[1].clones[3].x).toEqual(30);
    expect(g1.players[1].clones[3].y).toEqual(13);

    // check for resource swap (spends 1 energy and yields 1 rocket)
    expect(ResourceHelper.getSpendCapacity(g1, c1, '1', 'energy1')).toEqual(4);
    expect(ResourceHelper.getSpendCapacity(g1, c1, '1', 'rocket')).toEqual(6);
  });

  test('player 0: move onto battle tile', () => {
    // roll
    client0.moves.rollDie(); // 6
    // select a clone
    client0.moves.selectClone(136, '0');
    // select laser battle tile
    client0.moves.selectCloneMoveTarget(142, '0');
    const { G: g0, ctx: c0 } = client0.store.getState();
    expect(c0.activePlayers[c0.currentPlayer]).toEqual('activateModule');
    // test queued gunners
    expect(g0.stagedTargetOptions.length).toBeGreaterThan(0);
    expect(g0.stagedTargetOptions).toEqual([{
      owner: '0', x: 8, y: 4, spy: false, gunner: true, arms: [],
    }]);
  });

  test('player 0: select gunner', () => {
    // select gunner
    client0.moves.selectModuleTargets(172, '0');
    const { G: g0 } = client0.store.getState();
    expect(g0.stagedActors).toEqual([{
      owner: '0', x: 8, y: 4, spy: false, gunner: true, arms: [],
    }]);
  });

  test('player 0: fire laser and verify damage/cost', () => {
    // fire
    client0.moves.confirmModuleTargetSelection();
    // test damage
    const { G: g0, ctx: c0 } = client0.store.getState();
    expect(g0.cells[487].damaged).toEqual(true);
    // test spend
    expect(ResourceHelper.getSpendCapacity(g0, c0, '0', 'energy1')).toEqual(4);
    // test turn stage
    expect(c0.currentPlayer).toEqual('1');
  });

  test('player 1: test clone movement near damage', () => {
    client1.moves.rollDie(); // 2
    client1.moves.selectClone(485, '1');
    const { G: g1, ctx: c1 } = client1.store.getState();
    client1.moves.selectCloneMoveTarget(483, '1');
    // expect(g1.stagedModuleOptions).toEqual([{ x: 23, y: 0 }]);
    // console.log(c1.activePlayers[c1.currentPlayer]);
    // expect(c1.currentPlayer).toEqual('0');
  });

  // TODO
  test('player 0: fire rocket', () => { });
  // TODO
  test('player 1: test lock', () => {});
  // TODO
  test('player 1: arm clones (and move rocket)', () => { });
  // TODO
  test('player 0: fire thermite (and move rocket)', () => { });
  // TODO
  test('player 1: repair tile', () => { });
  // TODO
  test('player 0: fire biodrone', () => { });
  // TODO
  test('player 1: test selecting clone move then selecting another', () => {
    // TODO: roll, select clone, then select another
    // TODO: check that stagedCells match the second selection
  });
});
