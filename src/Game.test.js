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

    // TODO: player1 fire thermite
    client1.moves.rollDie('1'); // 2
    client1.moves.selectClone(506, '1');
    client1.moves.selectCloneMoveTarget(504, '1');
    client1.moves.selectModuleTargets(465, '1');
    client1.moves.confirmModuleTargetSelection('1');

    const { G: g0, ctx: c0 } = client0.store.getState();
    expect(g0.cells[541].damaged).toEqual(true);
    expect(g0.cells[24].damaged).toEqual(true);
  });

  test('shield', () => {
    // TODO: setup
    const matchID = 'shchit';
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
    expect(ResourceHelper.getSpendCapacity(g0, c0, '0', 'energy')).toEqual(9);
    // check placement
    expect(g0.players[0].rbss).toEqual([{
      type: 'shield', x: 14, y: 0, owner: '0',
    }]);

    // TODO: block laser (this requires prompting player 0 for spend approval)
    client1.moves.rollDie('1'); // 6
    client1.moves.selectClone(486, '1');
    client1.moves.selectCloneMoveTarget(484, '1');
    client1.moves.selectModuleTargets(462, '1');
    client1.moves.confirmModuleTargetSelection('1');

    // TODO: check blocking cost
    // TODO: check no damage
    const { G: g1, ctx: c1 } = client1.store.getState();
    // console.log(c1);
    // expect(g1.cells[168].damaged).toEqual(false);

    // TODO: block again
    // TODO: check destroyed
  });
  test('biodrone', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check flight
    // TODO: check landing on surface, warehouse, and battle/armory/prod
  });
  test('satellite', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check placement
    // TODO: fire on rocket
    // TODO: check rocket destroyed
  });
  test('laser', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check damage
  });
  test('repair and repairTwo', () => {
    // TODO: setup
    // TODO: fire 1
    // TODO: check 1 damage state
    // TODO: fire 2
    // TODO: check 2 damage state
  });
  test('rocket', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check flight
    // TODO: check touchdown
    // TODO: check damage
    // TODO: fire NUKE
    // TODO: check NUKE flight
    // TODO: check NUKE touchdown
    // TODO: check NUKE damage
  });
  test('espionage', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check spy state
    // TODO: check spy controls
  });
  test('takeover', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check satellite owner
  });
  test('counterEspionage', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check spy state
  });
  test('armory 1 and 2', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check kill zone
  });
  test('bomb', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check slash & burn with a clone
  });
});

describe('production tiles', () => {
  test('lichen and lichenTwo', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('rocketWorkshop', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('uraniumMine', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('foundry', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('chemicalReactor and chemicalReactorTwo', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('thermalGenerator', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('prodRepair', () => {
    // TODO: fire
    // TODO: check damage state
    // TODO: check conversion
  });
  test('nuclearReactor', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('sensorCabin', () => {
    // TODO: fire
    // TODO: check on dead biodrone
  });
  test('biocollector', () => {
    // TODO: fire
    // TODO: check conversion
  });
  test('airFilter', () => {
    // TODO: fire
    // TODO: check conversion
    // TODO: check clone increase
  });
  test('nuclear armory', () => {
    // TODO: fire
    // TODO: check conversion
    // TODO: check nuke warhead
  });
});
