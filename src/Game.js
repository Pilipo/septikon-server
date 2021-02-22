import PersonnelHelper from './helpers/personnelHelper';
import ResourceHelper from './helpers/resourceHelper';
import { TileHelper, tileProperties } from './helpers/tileHelper';
import WeaponHelper from './helpers/weaponHelper';

function goToNextStage(G, ctx) {
  const currentStage = ctx.activePlayers[ctx.currentPlayer];
  const playerID = ctx.currentPlayer;
  switch (currentStage) {
    case 'rollDie':
      ctx.events.endStage();
      break;

    case 'moveClone':
      switch (G.stagedObject.type) {
        case 'surface': {
          const tarCoords = { x: G.stagedObject.x, y: G.stagedObject.y };
          const tarClone = PersonnelHelper.getCloneByCoordinates(G, playerID, tarCoords);
          tarClone.gunner = true;
          break;
        }
        case 'armory':
          // console.log('arm clones and biodrones');
          break;
        case 'production': {
          switch (G.stagedObject.name) {
            case 'lichen':
            case 'lichenTwo':
            case 'nuclearReactor':
            case 'nuclearArmory':
            case 'biocollector':
            case 'rocketWorkshop':
            case 'foundry':
            case 'airFilter':
            case 'chemicalReactor':
            case 'chemicalReactorTwo':
            case 'uraniumMine':
            case 'foundryTwo':
            case 'thermalGenerator': {
              const ct = G.stagedObject.resourceCostType;
              const cc = G.stagedObject.resourceCostCount;
              const yt = G.stagedObject.resourceYieldType;
              const yc = G.stagedObject.resourceYieldCount;
              ct.forEach((type, idx) => {
                ResourceHelper.removeResource(G, ctx, playerID, type, cc[idx]);
              });
              yt.forEach((type, idx) => {
                ResourceHelper.addResource(G, ctx, playerID, type, yc[idx]);
              });
              break;
            }
            default:
              break;
          }
          break;
        }
        case 'battle': {
          let hasReqs = false;
          switch (G.stagedObject.name) {
            case 'thermite':
            case 'shield':
            case 'biodrone':
            case 'satellite':
            case 'laser':
            case 'rocket': {
              const gunners = PersonnelHelper.getGunners(G, ctx);
              if (gunners.length > 0) {
                hasReqs = true;
                G.stagedCells = gunners;
              }
              // TODO: check for gunnerCap (based on resources)
            }
            // fall through
            case 'espionage':
            case 'takeover':
              // TODO: check gunners' fire line for targets (clones or satellites)
              // TODO: if checks out set Stage to 'activateModule' and assign stagedCells of gunners
              break;
            case 'repair':
            case 'repairTwo':
              // TODO: check for damaged tiles
              // TODO: check for resources
              // TODO: if true set Stage to 'activateModule' and assign stagedCells of damaged tiles
              break;
            case 'counterespionage':
              // TODO: check for spies among us
              // TODO: check for resources
              // TODO: if true set Stage to 'activateModule' and assign stagedCells of spies
              break;
            default:
              break;
          }
          if (hasReqs) {
            G.stageConfirmed = false;
            ctx.events.endStage();
            return;
          }
          // const ct = G.stagedObject.resourceCostType;
          // const cc = G.stagedObject.resourceCostCount;
          // ct.forEach((type, idx) => {
          //   ResourceHelper.removeResource(G, ctx, playerID, type, cc[idx]);
          // });
          break;
        }
        default:
          throw new Error(`Expected a "free" module. Instead got ${G.stagedObject.type}`);
      }
      // fall through
    case 'activateModule': {
      if (G.stagedTokens.length) {
        const targets = WeaponHelper.getGunnersTargets(G, G.stagedTokens, G.stagedObject);
        console.log('blow stuff up');
      }
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
      G.stagedObject = null;
      G.stagedCells = [];
      ctx.events.endTurn();
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
            // console.log(`moving ${stagedClone.x}, ${stagedClone.y}`);
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
          const gunner = PersonnelHelper.getCloneByCoordinates(G, playerID, coords);
          // TODO: check cost per gunner
          if (gunner !== null && gunner.gunner === true) {
            G.stagedTokens.push(gunner);
          }
          // TODO: Fire module after gunner selection (if reqs allow)");
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
  G.rollValue = roll;
  G.rollHistory.unshift(roll);
  goToNextStage(G, ctx);
}

function confirmSetup(G, ctx, playerID) {
  if (G.players[playerID].clones.length === 5) {
    G.setupConfirmations[playerID] = !G.setupConfirmations[playerID];
    ctx.events.endTurn();
  }
}

function confirmNext(G, ctx) {
  G.stageConfirmed = true;
  goToNextStage(G, ctx);
}

const Septikon = {
  seed: 42,
  setup: () => ({
    cells: Array(651).fill(tileProperties),
    clickedCell: null,
    stagedObject: null,
    stagedCells: [],
    stagedTokens: [],
    stageConfirmed: false,
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
      },
      {
        clones: [],
        biodrones: [],
        ordnance: [],
        shields: [],
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
            moves: { clickCell, confirmNext },
            next: 'moveBiodrones',
          },

          moveBiodrones: {
            moves: { clickCell, confirmNext },
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
