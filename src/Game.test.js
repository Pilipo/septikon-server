import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import Septikon from './Game';
import ResourceHelper from './helpers/resourceHelper';

describe('battle and armory tiles', () => {
  test('thermite', () => {
    const matchID = 'kleshch';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(167, '0');
    client0.moves.placeClone(140, '0');
    client0.moves.placeClone(136, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(483, '1');
    client1.moves.placeClone(506, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(485, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(167, '0');
    client0.moves.selectCloneMoveTarget(184, '0');

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(483, '1');
    client1.moves.selectCloneMoveTarget(465, '1');

    // fire thermite
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(140, '0');
    client0.moves.selectCloneMoveTarget(146, '0');
    client0.moves.selectModuleTargets(184, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // player1 fire thermite
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(504, '1');
    client1.moves.selectModuleTargets(465, '1');
    client1.moves.confirmModuleTargetSelection('1');

    const { G: g0, ctx: c0 } = client0.store.getState();
    expect(g0.cells[541].damaged).toEqual(true);
    expect(g0.cells[24].damaged).toEqual(true);
  });

  test('shield repair', () => {
    // setup
    const matchID = 'remontnyy shchit';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(139, '0');
    client0.moves.placeClone(136, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(506, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(485, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0');

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(462, '1');

    // deploy shield
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(139, '0');
    client0.moves.selectCloneMoveTarget(145, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    const { G: g0, ctx: c0 } = client0.store.getState();
    // check initial cost
    const cap0a = ResourceHelper.getSpendCapacity(g0, c0, '0', 'energy');
    expect(cap0a).toEqual(9);
    // check placement
    expect(g0.players[0].rbss).toEqual([{
      damaged: false, hasMoved: true, type: 'shield', x: 14, y: 0, owner: '0', hasWarhead: false,
    }]);

    // block laser and damage shield
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(484, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection('1');
    // player 0 repairs and submits confirmation
    client0.moves.repairShield('0', 294);
    client0.moves.confirmShieldRepairs('0');
    const { G: g1, ctx: c1 } = client1.store.getState();
    // check no damage
    expect(g1.cells[168].damaged).toEqual(false);
    // check blocking cost
    const cap0b = ResourceHelper.getSpendCapacity(g1, c1, '0', 'energy');
    expect(cap0b).toEqual(8);

    // check return to roll through p1 and end turn
    expect(c1.activePlayers).toEqual({ 0: 'rollDie' });
  });

  test('shield destroy', () => {
    // TODO: setup
    const matchID = 'slomat shchit';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(139, '0');
    client0.moves.placeClone(136, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(506, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(485, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0');

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(462, '1');

    // deploy shield
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(139, '0');
    client0.moves.selectCloneMoveTarget(145, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    const { G: g0, ctx: c0 } = client0.store.getState();
    // check initial cost
    const cap0a = ResourceHelper.getSpendCapacity(g0, c0, '0', 'energy');
    expect(cap0a).toEqual(9);
    // check placement
    expect(g0.players[0].rbss).toEqual([{
      damaged: false, hasMoved: true, type: 'shield', x: 14, y: 0, owner: '0', hasWarhead: false,
    }]);

    // block laser and damage shield
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(484, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection('1');
    // player 0 repairs and submits confirmation
    client0.moves.confirmShieldRepairs('0');
    const { G: g1, ctx: c1 } = client1.store.getState();
    // check no damage
    expect(g1.cells[168].damaged).toEqual(false);
    // check blocking cost
    const cap0b = ResourceHelper.getSpendCapacity(g1, c1, '0', 'energy');
    expect(cap0b).toEqual(9);
    // TODO: check destroyed
    expect(g1.players[0].rbss.length).toEqual(0);
    // check return to roll through p1 and end turn
    expect(c1.activePlayers).toEqual({ 0: 'rollDie' });
  });

  test('biodrone capsule landing', () => {
    // setup
    const matchID = 'ubiytsa';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(139, '0');
    client0.moves.placeClone(156, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(506, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(485, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(462, '1');

    // launch biodrone
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(156, '0');
    client0.moves.selectCloneMoveTarget(162, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(462, '1');
    client1.moves.selectCloneMoveTarget(464, '1');
    client1.moves.selectOrdnance(294, '1');

    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(168, '0');
    client0.moves.selectCloneMoveTarget(172, '0');
    client0.moves.confirmOrdnanceSelection();

    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(464, '1');
    client1.moves.selectCloneMoveTarget(470, '1');
    client1.moves.confirmOrdnanceSelection();

    // check landing
    const { G: g0, ctx: c0 } = client0.getState();
    expect(g0.players[0].biodrones[0]).toEqual({ x: 26, y: 0 });
    expect(g0.cells[546].occupied).toEqual(true);
    expect(c0.activePlayers).toEqual({ 0: 'rollDie' });
  });

  test('satellite', () => {
    // setup
    const matchID = 'sputnik';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(139, '0');
    client0.moves.placeClone(132, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(506, '1');
    client1.moves.placeClone(485, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(462, '1'); // <- p1 gunner tile

    // launch satellite
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(132, '0');
    client0.moves.selectCloneMoveTarget(126, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // check placement
    const { G: g0 } = client0.getState();

    expect(g0.players[0].rbss[0]).toEqual({
      type: 'satellite',
      x: 14,
      y: 0,
      owner: '0',
      damaged: false,
      hasMoved: true,
      hasWarhead: false,
    });

    // p1 launch rocket
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(485, '1');
    client1.moves.selectCloneMoveTarget(487, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection('1');

    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(168, '0');
    client0.moves.selectCloneMoveTarget(172, '0');
    client0.moves.confirmOrdnanceSelection();

    // check rocket destroyed
    const { G: g1, ctx: c1 } = client0.getState();
    expect(g1.players[1].rbss[0]).toEqual(undefined);
    expect(c1.activePlayers).toEqual({ 1: 'rollDie' });
  });

  test('laser', () => {
    // setup
    const matchID = 'peresvet';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(138, '0');
    client0.moves.placeClone(160, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(506, '1');
    client1.moves.placeClone(485, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(462, '1'); // <- p1 gunner tile

    // fire laser
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(160, '0');
    client0.moves.selectCloneMoveTarget(166, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // check clone kill
    const { G: g0, ctx: c0 } = client0.getState();
    expect(g0.cells[483].damaged).toEqual(false);
    expect(g0.cells[462].occupied).toEqual(false);
    expect(g0.players[1].clones.length).toEqual(4);

    // waste a p1 turn
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(484, '1');
    client1.moves.selectCloneMoveTarget(486, '1');

    // fire again
    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(138, '0');
    client0.moves.selectCloneMoveTarget(142, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // test damage

    const { G: g1 } = client1.getState();
    expect(g1.cells[483].damaged).toEqual(true);
  });

  test('repair', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6
    const matchID = 'remont';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(138, '0');
    client0.moves.placeClone(160, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(500, '1');
    client1.moves.placeClone(512, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(500, '1');
    client1.moves.selectCloneMoveTarget(482, '1'); // <- p1 gunner tile

    // fire laser
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(160, '0');
    client0.moves.selectCloneMoveTarget(166, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // check damage
    const { G: g0, ctx: c0 } = client0.getState();
    expect(g0.cells[483].damaged).toEqual(true);

    // repair 1
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(512, '1');
    client1.moves.selectCloneMoveTarget(514, '1');
    client1.moves.selectModuleTargets(483, '1');

    const { G: g1, ctx: c1 } = client0.getState();
    expect(g1.cells[483].damaged).toEqual(false);
    // check resources
    expect(ResourceHelper.getSpendCapacity(g1, c1, '1', 'metal')).toEqual(4);
  });

  test('repairTwo', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6
    const matchID = 'remontirovat dvazhdy';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(156, '0');
    client0.moves.placeClone(160, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(500, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(500, '1');
    client1.moves.selectCloneMoveTarget(482, '1'); // <- p1 gunner tile

    // fire laser
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(160, '0');
    client0.moves.selectCloneMoveTarget(166, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // move gunner
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(482, '1');
    client1.moves.selectCloneMoveTarget(480, '1'); // <- p1 gunner tile

    // fire laser again
    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(156, '0');
    client0.moves.selectCloneMoveTarget(152, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // check damage
    const { G: g0, ctx: c0 } = client0.getState();
    expect(g0.cells[483].damaged).toEqual(true);
    expect(g0.cells[504].damaged).toEqual(true);

    // repair 2
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(509, '1');
    client1.moves.selectCloneMoveTarget(515, '1');
    client1.moves.selectModuleTargets(483, '1');
    client1.moves.selectModuleTargets(504, '1');

    const { G: g1, ctx: c1 } = client0.getState();
    expect(g1.cells[483].damaged).toEqual(false);
    expect(g1.cells[504].damaged).toEqual(false);
    expect(ResourceHelper.getSpendCapacity(g1, c1, '1', 'metal')).toEqual(3);
    expect(ResourceHelper.getSpendCapacity(g1, c1, '1', 'oxygen')).toEqual(3);
  });

  test('rocket', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6
    const matchID = 'raketa';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(156, '0');
    client0.moves.placeClone(131, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(500, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(500, '1');
    client1.moves.selectCloneMoveTarget(482, '1'); // <- p1 gunner tile

    // fire rocket
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(131, '0');
    client0.moves.selectCloneMoveTarget(137, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');

    // check flight
    const { G: g0 } = client0.getState();
    expect(g0.players[0].rbss[0].x).toEqual(14);

    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(482, '1');
    client1.moves.selectCloneMoveTarget(480, '1'); // <- p1 gunner tile
    client1.moves.confirmOrdnanceSelection();
    const { G: g1 } = client0.getState();
    expect(g1.players[0].rbss[0].x).toEqual(16);

    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(168, '0');
    client0.moves.selectCloneMoveTarget(172, '0'); // <- p0 gunner tile
    client0.moves.confirmOrdnanceSelection();
    const { G: g2 } = client0.getState();
    expect(g2.players[0].rbss[0].x).toEqual(20);

    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(480, '1');
    client1.moves.selectCloneMoveTarget(474, '1'); // <- p1 gunner tile
    client1.moves.confirmOrdnanceSelection();
    const { G: g3, ctx: c3 } = client0.getState();
    // check touchdown
    expect(g3.players[0].rbss.length).toEqual(0);

    // check damage
    expect(g3.cells[546].damaged).toEqual(true);
    expect(ResourceHelper.getSpendCapacity(g3, c3, '0', 'rocket')).toEqual(4);
  });

  test('nuke', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'yadernaya bomba';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(156, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(500, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(500, '1');
    client1.moves.selectCloneMoveTarget(482, '1'); // <- p1 gunner tile

    // build warhead
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(14, '0');
    client0.moves.selectCloneMoveTarget(20, '0');

    // p1 waste turn
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(482, '1');
    client1.moves.selectCloneMoveTarget(480, '1'); // <- p1 gunner tile

    // TODO: fire NUKE
    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(133, '0');
    client0.moves.selectCloneMoveTarget(137, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection('0');
    const { G: g0 } = client0.getState();
    expect(g0.players[0].rbss[0]).toEqual({
      type: 'rocket',
      x: 12,
      y: 0,
      owner: '0',
      damaged: false,
      hasMoved: false,
      hasWarhead: true,
    });

    // TODO: check NUKE flight
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(480, '1');
    client1.moves.selectCloneMoveTarget(474, '1'); // <- p1 gunner tile
    client1.moves.confirmOrdnanceSelection();

    const { G: g1 } = client0.getState();
    expect(g1.cells[378].occupied).toEqual(true);
    expect(g1.cells[252].occupied).toEqual(false);
    expect(g1.players[0].rbss[0].x).toEqual(18);

    client0.moves.rollDie('0'); // 1
    client0.moves.selectClone(30, '0');
    client0.moves.selectCloneMoveTarget(29, '0');
    client0.moves.confirmOrdnanceSelection();

    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(648, '1');
    client1.moves.selectCloneMoveTarget(644, '1'); // <- p1 gunner tile
    client1.moves.confirmOrdnanceSelection();
    const { G: g9, ctx: c9 } = client0.getState();
    // check NUKE touchdown
    expect(g9.players[0].rbss).toEqual([]);
    // check NUKE damage
    expect(g9.cells[483].damaged).toEqual(true);
    expect(g9.cells[484].damaged).toEqual(true);
    expect(g9.cells[504].damaged).toEqual(true);
  });

  test('espionage', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'shpionazh';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(152, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(633, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(516, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(633, '1');
    client1.moves.selectCloneMoveTarget(609, '1'); // <- p1 gunner tile

    // fire brainwaves!
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(152, '0');
    client0.moves.selectCloneMoveTarget(158, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection();

    // check spy state
    const { G: g0, ctx: c0 } = client0.getState();
    expect(g0.players[1].clones[0]).toEqual({
      owner: '1', x: 29, y: 0, spy: true, gunner: false, arms: [],
    });

    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(648, '1');
    client1.moves.selectCloneMoveTarget(646, '1');

    // check spy controls
    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(609, '0');
    const { G: g1, ctx: c1 } = client0.getState();
    expect(g1.stagedModuleOptions).toEqual([{ x: 30, y: 3 }, { x: 29, y: 4 }]);
    // TODO: test module activation
    client0.moves.selectCloneMoveTarget(613, '0');

    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(613, '1');

    const { G: g2, ctx: c2 } = client0.getState();
    expect(g2.stagedModuleOptions).toEqual([]);
    expect(g2.players[1].clones[0]).toEqual({
      owner: '1', x: 29, y: 4, spy: true, gunner: false, arms: [],
    });
  });

  test('counterEspionage', () => {
    // persist from previous setup
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'shpionazh';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    // p1 fires countermeasures
    client1.moves.selectClone(516, '1');
    client1.moves.selectCloneMoveTarget(522, '1');
    client1.moves.selectModuleTargets(613, '1');

    const { G: g2, ctx: c2 } = client0.getState();
    expect(g2.players[1].clones[0]).toEqual({
      owner: '1', x: 29, y: 4, spy: false, gunner: false, arms: [],
    });
  });

  test('takeover', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'perenimat';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(132, '0');
    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(633, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(491, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(462, '1'); // <- p1 gunner tile

    // launch sat
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(132, '0');
    client0.moves.selectCloneMoveTarget(126, '0');
    client0.moves.selectModuleTargets(168, '0');
    client0.moves.confirmModuleTargetSelection();
    const { G: g0, ctx: c0 } = client0.getState();
    expect(g0.players[0].rbss[0]).toEqual({
      type: 'satellite',
      x: 14,
      y: 0,
      owner: '0',
      damaged: false,
      hasMoved: true,
      hasWarhead: false,
    });
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(491, '1');
    client1.moves.selectCloneMoveTarget(489, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection();

    const { G: g1 } = client0.getState();
    expect(g1.players[0].rbss[0]).toEqual({
      type: 'satellite',
      x: 14,
      y: 0,
      owner: '1',
      damaged: false,
      hasMoved: true,
      hasWarhead: false,
    });

    // TODO: test rocket destruction (p0)
    // TODO: test rocket pass (p1)
  });

  test('armory 1', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'odin arsenal';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(167, '0');
    client0.moves.placeClone(73, '0');
    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(147, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(633, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(490, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // test being armed at setup
    const { G: g0 } = client0.getState();
    expect(g0.players[0].clones[0].arms).toEqual([{ type: 'cannon' }]);

    // p0 gets southern gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(167, '0');
    client0.moves.selectCloneMoveTarget(184, '0'); // <- p0 gunner tile

    // p1 gets northern gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(462, '1'); // <- p1 gunner tile

    // p0 moves gunner
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(184, '0');
    client0.moves.selectCloneMoveTarget(178, '0'); // <- p0 gunner tile

    // p1 fires espionage through northern gunner; takes spy
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(490, '1');
    client1.moves.selectCloneMoveTarget(492, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection();

    // p0 moves gunner
    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(178, '0');
    client0.moves.selectCloneMoveTarget(174, '0');

    // p1 moves spy into a striking distance
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(147, '1');
    client1.moves.selectCloneMoveTarget(153, '1');
    client1.moves.confirmModuleTargetSelection();

    // TODO: check kill zone
    const { G: g3, ctx: c3 } = client0.getState();
    expect(g3.players[0].clones.length).toEqual(3);
    expect(g3.players[1].clones.length).toEqual(5);

    // TODO: test being armed after setup
    // TODO: check kill zone
  });

  test('armory 2', () => {
    // setup
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'dva arsenala';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(167, '0');
    client0.moves.placeClone(94, '0');
    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(147, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(633, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(490, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // test being armed at setup
    const { G: g0 } = client0.getState();
    expect(g0.players[0].clones[0].arms).toEqual([{ type: 'drill' }]);

    // p0 gets southern gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(167, '0');
    client0.moves.selectCloneMoveTarget(184, '0'); // <- p0 gunner tile

    // p1 gets northern gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(462, '1'); // <- p1 gunner tile

    // p0 moves gunner
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(184, '0');
    client0.moves.selectCloneMoveTarget(178, '0'); // <- p0 gunner tile

    // p1 fires espionage through northern gunner; takes spy
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(490, '1');
    client1.moves.selectCloneMoveTarget(492, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection();

    // p0 moves gunner
    client0.moves.rollDie('0'); // 4
    client0.moves.selectClone(178, '0');
    client0.moves.selectCloneMoveTarget(174, '0');

    // p1 moves spy into a striking distance
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(147, '1');
    client1.moves.selectCloneMoveTarget(153, '1');
    client1.moves.confirmModuleTargetSelection();

    // check kill zone
    const { G: g3, ctx: c3 } = client0.getState();
    expect(g3.players[0].clones.length).toEqual(4);
    expect(g3.players[1].clones.length).toEqual(5);

    // TODO: test being armed after setup
    // TODO: check kill zone
  });

  test('bomb', () => {
    const matchID = 'vzryvchatka';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(167, '0');
    client0.moves.placeClone(52, '0');
    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(147, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(633, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(486, '1');
    client1.moves.placeClone(490, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // test being armed at setup
    const { G: g0 } = client0.getState();
    expect(g0.players[0].clones[0].arms).toEqual([{ type: 'explosives' }]);

    // p0 gets southern gunner
    // TODO: set explosive
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(167, '0');
    client0.moves.selectCloneMoveTarget(184, '0'); // <- p0 gunner tile

    // p1 gets northern gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(462, '1'); // <- p1 gunner tile

    // p0 moves gunner
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(184, '0');
    client0.moves.selectCloneMoveTarget(178, '0'); // <- p0 gunner tile

    // check destruction
    const { G: g3, ctx: c3 } = client0.getState();
    expect(g3.players[0].clones.length).toEqual(5);
    expect(g3.players[1].clones.length).toEqual(5);
  });
});

describe('production tiles', () => {
  test.skip('lichen and lichenTwo', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('rocketWorkshop', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('uraniumMine', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('foundry', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('chemicalReactor and chemicalReactorTwo', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('thermalGenerator', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('prodRepair', () => {
    // TODO: fire
    // TODO: check damage state
    // TODO: check conversion
  });
  test.skip('nuclearReactor', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('sensorCabin', () => {
    // TODO: fire
    // TODO: check on dead biodrone
  });
  test.skip('biocollector', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test.skip('airFilter', () => {
    // TODO: fire
    // TODO: check conversion
    // TODO: check clone increase
  });
  test('nuclear armory', () => {
    // roll order 5, 4, 6, 2, 4, 6, 1, 4
    const matchID = 'boyegolovka';
    const client0 = Client({
      game: Septikon, playerID: '0', multiplayer: Local(), matchID,
    });
    const client1 = Client({
      game: Septikon, playerID: '1', multiplayer: Local(), matchID,
    });
    client0.start();
    client1.start();

    client0.moves.placeClone(151, '0');
    client0.moves.placeClone(156, '0');
    client0.moves.placeClone(133, '0');
    client0.moves.placeClone(30, '0');
    client0.moves.placeClone(14, '0');
    client0.moves.confirmSetup('0');

    client1.moves.placeClone(500, '1');
    client1.moves.placeClone(509, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(484, '1');
    client1.moves.confirmSetup('1');

    // get a gunner
    client0.moves.rollDie('0'); // 5
    client0.moves.selectClone(151, '0');
    client0.moves.selectCloneMoveTarget(168, '0'); // <- p0 gunner tile

    // get a gunner
    client1.moves.rollDie('1'); // 4
    client1.moves.selectClone(500, '1');
    client1.moves.selectCloneMoveTarget(482, '1'); // <- p1 gunner tile

    // build warhead
    client0.moves.rollDie('0'); // 6
    client0.moves.selectClone(14, '0');
    client0.moves.selectCloneMoveTarget(20, '0');
  });
});
