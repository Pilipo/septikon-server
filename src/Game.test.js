import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import Septikon from './Game';
import ResourceHelper from './helpers/resourceHelper';

const matchID = 'sputnik';
const client0 = Client({
  game: Septikon, playerID: '0', multiplayer: Local(), matchID,
});
client0.start();
const client1 = Client({
  game: Septikon, playerID: '1', multiplayer: Local(), matchID,
});
client1.start();
describe('basic game runthrough', () => {
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
    client1.moves.placeClone(650, '1');
    client1.moves.placeClone(649, '1');
    client1.moves.placeClone(648, '1');
    client1.moves.placeClone(647, '1');
    client1.moves.placeClone(646, '1');
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
      x: 8, y: 4, spy: false, gunner: true,
    }]);
  });

  test('player 0: select gunner', () => {
    // select gunner
    client0.moves.selectModuleTargets(172, '0');
    const { G: g0 } = client0.store.getState();
    expect(g0.stagedActors).toEqual([{
      x: 8, y: 4, spy: false, gunner: true,
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

  test('player 1: move through lock', () => { });
  test('player 1: test clone movement near damage', () => { });
  test('player 0: fire rocket', () => { });
  test('player 1: arm clones (and move rocket)', () => { });
  test('player 0: fire thermite (and move rocket)', () => { });
  test('player 1: repair tile', () => { });
  test('player 0: fire biodrone', () => { });
  test('player 1: test selecting clone move then selecting another', () => {
    // TODO: roll, select clone, then select another
    // TODO: check that stagedCells match the second selection
  });
});

describe('battle and armory tiles', () => {
  test('thermite', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check damage
  });
  test('shield', () => {
    // TODO: setup
    // TODO: fire
    // TODO: check placement
    // TODO: block laser
    // TODO: check cost
    // TODO: check no damage
    // TODO: block again
    // TODO: check destroy
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
