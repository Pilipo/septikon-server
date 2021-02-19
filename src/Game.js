import PersonnelHelper from './helpers/personnelHelper';
import { TileHelper, tileProperties } from './helpers/tileHelper';

function goToNextStage(G, ctx) {
  const currentStage = ctx.activePlayers[ctx.currentPlayer];
  const playerID = ctx.currentPlayer;
  switch (currentStage) {
    case 'rollDie':
      ctx.events.endStage();
      break;

    case 'moveClone':
      // TODO: Calculate Requirements
      // Potential Reqs include: resource cost, damaged tile, gunner,
      // spy, enemy biodrone, satellite in gunner line of sight, enemy clone in gunner line of sight
      //
      // if player meets requirements
      //     activate automatics modules and fall through
      //     if not automatic, setStage('activateModule')
      // else
      // fall through
    case 'activateModule':
      switch (G.stagedObject.type) {
        case 'surface': {
          const tarCoords = { x: G.stagedObject.x, y: G.stagedObject.y };
          const tarClone = PersonnelHelper.getCloneByCoordinates(G, playerID, tarCoords);
          tarClone.gunner = true;
          ctx.endStage();
          break;
        }
        case 'armory':
          console.log('arm clones and biodrones');
          break;
        case 'lichen':
          console.log('produce 1 biomass');
          break;
        case 'lichenTwo':
          console.log('produce 1 biomass');
          break;
        default:
          throw new Error(`Expected a "free" module. Instead got ${G.stagedObject.type}`);
      }
    // TODO: if biodrone.length > 0 then setStage('moveBiodrones')
    // falls through
    case 'moveBiodrones':
    // TODO: if ordnance.length > 0 then setStage('moveOrdnance')
    // falls through
    case 'moveOrdnance':
    // TODO: if arms.length > 0 then setStage('fireArms')
    // falls through
    case 'fireArms':
    // TODO: clean up for next turn and endTurn()
    // falls through
    default:
      break;
  }
}

function clickCell(G, ctx, id, playerID) {
  G.clickedCell = TileHelper.getClickedTileByIndex(G, id);
  const coords = TileHelper.tileIndexToCoordinates(id);
  if (ctx.phase === 'layout') {
    const cloneIndex = PersonnelHelper.getCloneIndexByCoordinates(G, playerID, coords);
    if (cloneIndex === false) {
      PersonnelHelper.placeClone(G, playerID, coords);
    } else {
      PersonnelHelper.removeClone(G, playerID, coords);
    }
  } else {
    const currentStage = ctx.activePlayers[ctx.currentPlayer];
    switch (currentStage) {
      case 'moveClone':
        if (G.stagedObject === null || typeof G.stagedObject === 'undefined') {
          const cloneIndex = PersonnelHelper.getCloneIndexByCoordinates(G, playerID, coords);
          G.stagedObject = G.players[playerID].clones[cloneIndex];
          G.stagedCells = PersonnelHelper.getClonesLegalMoves(G, playerID, G.rollValue, coords);
        } else {
          let stagedClone = null;
          G.stagedCells.forEach((legalCoord) => {
            if (JSON.stringify(legalCoord) === JSON.stringify(coords)) {
              stagedClone = G.stagedObject;
            }
          });
          if (stagedClone !== null) {
            PersonnelHelper.moveClone(G, playerID, { x: stagedClone.x, y: stagedClone.y }, coords);
            G.stagedCells = [];
            G.stagedObject = (G.clickedCell.type === 'lock' ? null : G.clickedCell);
            // advance turn stage
            goToNextStage(G, ctx);
          }
        }
        break;
      case 'activateModule':
        if (G.stagedObject.targetType === 'gunner') {
          // TODO: Fire module after gunner selection (if reqs allow)");
          // check requirements
          // activate cell
          // clear token/cell staging
          // advance turn stage
        } else {
          // TODO: Fire module after valid selection (if reqs allow)");
          // check requirements
          // activate cell
          // clear token/cell staging
          // advance turn stage
        }
        // Possible activations include:
        // - BATTLE
        // TODO: Gunner targetted: lasers, thermites, shield, biodrone,
        //       satellite, rocket, espionage, takeover
        // TODO: non-gunner targetted: counter-espionage, repair, repairTwo (set number of targets)
        // - PROD
        // TODO: automated: everything but...
        // TODO: non-gunner targetted: repair, sensor cabin
        // - ARMORY
        // TODO: automated: everything
        // - SURFACE
        // TODO: automated: set clone.gunner: true
        break;
      default:
    }
  }
}

function rollDie(G, ctx) {
  const roll = ctx.random.D6();
  // let roll = 2;
  G.rollValue = roll;
  G.rollHistory.unshift(roll);
  goToNextStage(G, ctx);
}

function confirmSetup(G, ctx, playerID) {
  // console.log('called by ' + playerID);
  if (G.players[playerID].clones.length === 5) {
    G.setupConfirmations[playerID] = !G.setupConfirmations[playerID];
    ctx.events.endTurn();
  }
}

const Septikon = {
  seed: 42,
  setup: () => ({
    cells: Array(651).fill(tileProperties),
    clickedCell: null,
    stagedObject: null,
    stagedCells: [],
    rollValue: 0,
    rollHistory: [],
    setupConfirmations: [
      false,
      false,
    ],
    players: [
      {
        clones: [],
        biodrones: [],
        ordnance: [],
        shields: [],
        resources: {},
      },
      {
        clones: [],
        biodrones: [],
        ordnance: [],
        shields: [],
        resources: {},
      },
    ],
  }),

  phases: {
    layout: {
      onBegin: (G) => {
        TileHelper.setOwnership(G);
        // DevHelper.stageForMoveClone(G, ctx);
      },
      // onEnd: (G, ctx) => {
      //     ctx.events.endTurn();
      // },
      endIf: (G) => {
        let playersReady = true;
        G.setupConfirmations.forEach((player) => {
          if (player === false) {
            playersReady = false;
          }
        });
        if (playersReady === true) {
          return true;
        }
        return false;
      },
      moves: {
        clickCell: {
          move: clickCell,
          client: false,
        },
        confirmSetup,
      },
      start: true,
      next: 'play',
    },
    play: {
      turn: {
        onBegin: (G, ctx) => {
          ctx.events.setActivePlayers({
            currentPlayer: 'rollDie',
          });
        },
        stages: {
          rollDie: {
            moves: { rollDie, clickCell },
            next: 'moveClone',
            start: true,
          },

          moveClone: {
            moves: { clickCell },
            next: 'activateModule',
          },

          activateModule: {
            moves: { clickCell },
            next: 'moveBiodrones',
          },

          moveBiodrones: {
            moves: { clickCell },
            next: 'moveOrdnance',
          },

          moveOrdnance: {
            moves: { clickCell },
            next: 'fire',
          },

          fireArms: {
            moves: { clickCell },
          },
        },
      },
    },
  },
};

export default Septikon;
