import PersonnelHelper from './helpers/personnelHelper';
import ResourceHelper from './helpers/resourceHelper';
import { TileHelper, tileProperties } from './helpers/tileHelper';
import WeaponHelper from './helpers/weaponHelper';

function clickCell(G, ctx, id, playerID) {
  G.clickedCell = G.cells[id];
}

function goToNextStage(G, ctx) {
  const currentStage = ctx.activePlayers[ctx.currentPlayer];
  const playerID = ctx.currentPlayer;
  switch (currentStage) {
    case 'moveClone':
      switch (G.selectedModuleForMove.type) {
        case 'lock':
          break;
        case 'surface': {
          const tarCoords = { x: G.selectedModuleForMove.x, y: G.selectedModuleForMove.y };
          const tarClone = PersonnelHelper.getCloneByCoordinates(G, playerID, tarCoords);
          tarClone.gunner = true;
          break;
        }
        case 'armory':
          // TODO: set arms somehow??
          break;
        case 'production': {
          switch (G.selectedModuleForMove.name) {
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
              const ct = G.selectedModuleForMove.resourceCostType;
              const cc = G.selectedModuleForMove.resourceCostCount;
              const yt = G.selectedModuleForMove.resourceYieldType;
              const yc = G.selectedModuleForMove.resourceYieldCount;
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
          switch (G.selectedModuleForMove.name) {
            case 'thermite':
            case 'shield':
            case 'biodrone':
            case 'satellite':
            case 'laser':
            case 'rocket': {
              const gunners = PersonnelHelper.getGunners(G, ctx);
              if (gunners.length > 0) {
                hasReqs = true;
                G.stagedTargetOptions = gunners;
              }
            }
            // fall through
            case 'espionage':
            case 'takeover':
              // TODO: check gunners' fire line for targets (clones or satellites)
              // TODO: if checks out set Stage to 'activateModule' and track gunners
              break;
            case 'repair':
            case 'repairTwo':
              // TODO: check for damaged tiles
              // TODO: check for resources
              // TODO: if true set Stage to 'activateModule' and track damaged tiles
              break;
            case 'counterespionage':
              // TODO: check for spies among us
              // TODO: check for resources
              // TODO: if true set Stage to 'activateModule' and track spies
              break;
            default:
              break;
          }
          if (hasReqs) {
            G.stageConfirmed = false;
            ctx.events.endStage();
            return;
          }
          break;
        }
        default:
          throw new Error(`Expected a "free" module. Instead got ${G.selectedModuleForMove.type}`);
      }
    // fall through
    case 'repairShield':
    case 'activateModule': {
      if (G.stagedActors.length) {
        const tile = G.selectedModuleForMove;
        if (tile.targetType === 'gunner') {
          const targets = WeaponHelper.getGunnersTargets(G, ctx, G.stagedActors, tile);
          targets.forEach((tar) => {
            if (tar === null) throw new Error('no target found!');
            tile.resourceCostType.forEach((ct, idx) => {
              ResourceHelper.removeResource(G, ctx, playerID, ct, tile.resourceCostCount[idx]);
            });
            switch (tile.name) {
              case 'laser':
                if (tar.name === 'space' || tar.name === 'surface') {
                  // get occupant
                  const oppID = playerID === '0' ? 1 : 0;
                  G.players[oppID].clones.forEach((clone, idx) => {
                    if (clone.x === tar.x && clone.y === tar.y) {
                      // kill clone and de-occupy
                      G.players[oppID].clones.splice(idx, 1);
                      tar.occupied = false;
                    }
                  });
                  G.players[oppID].rbss.forEach((ord, idx) => {
                    if (ord.x === tar.x && ord.y === tar.y) {
                      if (ord.type === 'shield') {
                        G.players[oppID].rbss[idx].damaged = true;
                      } else {
                        // remove ord and de-occupy
                        G.players[oppID].rbss.splice(idx, 1);
                        tar.occupied = false;
                      }
                    }
                  });
                } else {
                  tar.damaged = true;
                }
                break;
              case 'thermite':
                tar.damaged = true;
                break;
              case 'biodrone':
              case 'satellite':
              case 'rocket':
              case 'shield':
                G.players[playerID].rbss.push({
                  type: tile.name,
                  x: tar.x,
                  y: tar.y,
                  owner: playerID,
                  damaged: false,
                  hasMoved: true,
                });
                // TODO: should this live elsewhere?
                tar.occupied = true;
                break;
              default:
                break;
            }
          });
        }
      }
      // check for damaged shield(s) which result in phase shift
      const oppID = playerID === '0' ? 1 : 0;
      let phaseShift = false;
      G.stagedTargetOptions.splice(0, G.stagedTargetOptions.length);
      G.players[oppID].rbss.forEach((ord) => {
        if (ord.damaged === true) {
          phaseShift = true;
          G.stagedTargetOptions.push(ord);
        }
      });
      const c = ResourceHelper.getSpendCapacity(G, ctx, ctx.currentPlayer, 'energy');
      if (phaseShift && c > 0) {
        ctx.events.setActivePlayers({
          revert: true,
          others: 'repairShield',
        });
        break;
      }
    }
    // TODO: if biodrone.length > 0 then setStage('moveBiodrones') else
    // falls through
    case 'moveBiodrones': {
      // if moving ordnance is not found then fall through
      let ordFound = false;
      G.players.forEach((player) => {
        player.rbss.forEach((ord) => {
          if (ord.type !== 'shield' && ord.hasMoved === false) {
            ordFound = true;
          }
        });
      });
      if (ordFound) {
        ctx.events.setStage('moveOrdnance');
        break;
      }
    }
    // falls through
    case 'moveOrdnance': {
      const sats = WeaponHelper.getSatellites(G);
      let targets = [];
      if (sats !== null && sats.length > 0) {
        sats.forEach((sat) => {
          targets = targets.concat(WeaponHelper.getArmsTargets(G, playerID, sat));
        });
        // TODO: check clone/biodrone arms
      }
      if (targets.length) {
        if (targets.length === 1) {
          if (targets[0].type === 'rocket') {
            WeaponHelper.removeOrdnance(G, ctx, targets[0]);
          }
        } else {
          ctx.events.setStage('fireArms');
          break;
        }
      }
    }
    // falls through
    case 'fireArms':
    // TODO: clean up for next turn and endTurn()
    // falls through
    default:
      // cleanup
      G.selectedModuleForMove = null;
      G.stagedModuleOptions = [];
      G.stagedActors = [];
      WeaponHelper.resetMoves(G, ctx);
      ctx.events.endTurn();
      break;
  }
}

// function clickCell(G, ctx, id) {
//   G.clickedCell = TileHelper.getClickedTileByIndex(G, id);
// }

// PHASE: layout
function placeClone(G, ctx, id, playerID) {
  const coords = TileHelper.indexToCoordinates(id);
  const cloneIndex = PersonnelHelper.getCloneIndexByCoordinates(G, playerID, coords);
  if (cloneIndex === false) {
    PersonnelHelper.placeClone(G, playerID, coords);
  } else {
    PersonnelHelper.removeClone(G, playerID, coords);
  }
}

function confirmSetup(G, ctx, playerID) {
  if (G.players[playerID].clones.length === 5) {
    G.setupConfirmations[playerID] = !G.setupConfirmations[playerID];
    ctx.events.endTurn();
  }
}

// PHASE: play
// STAGE: rollDie
function rollDie(G, ctx) {
  const roll = ctx.random.D6();
  G.rollValue = roll;
  G.rollHistory.unshift(roll);
  ctx.events.endStage();
}

// STAGE: moveClone
function selectClone(G, ctx, id, playerID) {
  const coords = TileHelper.indexToCoordinates(id);
  const cloneIndex = PersonnelHelper.getCloneIndexByCoordinates(G, playerID, coords);
  G.stagedActors.push(G.players[playerID].clones[cloneIndex]);
  G.stagedModuleOptions = PersonnelHelper.getClonesLegalMoves(G, playerID, G.rollValue, coords);
}

function selectCloneMoveTarget(G, ctx, id, playerID) {
  let stagedClone = null;
  G.clickedCell = TileHelper.getClickedTileByIndex(G, id);
  const coords = TileHelper.indexToCoordinates(id);
  G.stagedModuleOptions.forEach((legalCoord) => {
    if (JSON.stringify(legalCoord) === JSON.stringify(coords)) {
      // if (G.stagedActors.length > 1) throw new Error('too many clones');
      stagedClone = G.stagedActors.pop();
    }
  });
  if (stagedClone !== null) {
    PersonnelHelper.moveClone(G, playerID, { x: stagedClone.x, y: stagedClone.y }, coords);
    G.stagedModuleOptions = [];
    G.selectedModuleForMove = G.clickedCell;
    // advance turn stage
    goToNextStage(G, ctx);
  }
}

// STAGE: activateModule
function selectModuleTargets(G, ctx, id, playerID) {
  const coords = TileHelper.indexToCoordinates(id);
  if (G.selectedModuleForMove === null) {
    console.log(id);
  }
  // console.log(G.selectedModuleForMove.targetType);
  const tile = G.selectedModuleForMove;
  if (tile.targetType === 'gunner') {
    const gunner = PersonnelHelper.getCloneByCoordinates(G, playerID, coords);
    if (gunner !== null && gunner.gunner === true) {
      let canAfford = false;
      tile.resourceCostType.forEach((ct, idx) => {
        const spendCap = ResourceHelper.getSpendCapacity(G, ctx, playerID, ct);
        if (tile.resourceCostCount[idx] * G.stagedActors.length <= spendCap) {
          canAfford = true;
        }
      });
      if (canAfford) G.stagedActors.push(gunner);
    }
  } else {
    // TODO: Fire module after valid selection (if reqs allow)");
    // check requirements
    // activate cell
    // clear token/cell staging
    // advance turn stage
  }
}

// TODO: confirmSelection
function confirmModuleTargetSelection(G, ctx) {
  // TODO: Spend resources
  // TODO: Fire module after gunner selection (if reqs allow)");
  G.stageConfirmed = true;
  goToNextStage(G, ctx);
}

// STAGE: moveBiodrones
// TODO: selectBiodrones
function selectBiodrones(G, ctx, id, playerID) {
  const tarAry = [];
  return tarAry;
}

// TODO: selectBiodroneMoveTarget
function selectBiodroneMoveTarget(G, ctx, id, playerID) {
  const tarTile = {};
  return tarTile;
}

// TODO: selectBiodroneMoveTarget
function confirmBiodroneMoves(G, ctx, id, playerID) {
  const tarTile = {};
  return tarTile;
}

// STAGE: moveOrdnance

function selectOrdnance(G, ctx, tileID) {
  const ord = WeaponHelper.getRBSSByTileIndex(G, ctx, tileID);
  WeaponHelper.moveOrdnance(G, ctx, ord);
  const unmoved = WeaponHelper.getUnmovedOrdnance(G, ctx);
  if (unmoved.length === 0) goToNextStage(G, ctx);
}

function confirmOrdnanceSelection(G, ctx) {
  const unmoved = WeaponHelper.getUnmovedOrdnance(G, ctx);
  if (unmoved.length === 0) goToNextStage(G, ctx);
  unmoved.forEach((ord) => WeaponHelper.moveOrdnance(G, ctx, ord));
  goToNextStage(G, ctx);
}

// STAGE: fireArms
// TODO: select arms (clones, satellites, and biodrones)
function selectArms() {
  const tarAry = [];
  return tarAry;
}

// TODO: confirmArmsSelections
function confirmArmsSelections() {
  const tarAry = [];
  return tarAry;
}

// (optional) repairShield
function repairShield(G, ctx, playerID, tileID) {
  const c = ResourceHelper.getSpendCapacity(G, ctx, playerID, 'energy');
  if (c > 0) {
    const shield = WeaponHelper.getRBSSByTileIndex(G, ctx, tileID);
    shield.damaged = false;
    ResourceHelper.removeResource(G, ctx, playerID, 'energy', 1);
  }
}

function confirmShieldRepairs(G, ctx, playerID) {
  // TODO: destroy damaged shields
  const ds = WeaponHelper.getDamagedShields(G, ctx, playerID);
  if (ds.length) {
    ds.forEach((shield) => {
      G.players[playerID].rbss.forEach((ps, idx) => {
        if (JSON.stringify(shield) === JSON.stringify(ps)) {
          G.players[playerID].rbss.splice(idx, 1);
        }
      });
    });
  }
  goToNextStage(G, ctx);
}

const Septikon = {
  seed: 42,
  setup: () => ({
    cells: Array(651).fill(tileProperties),
    stagedTargetOptions: [], // potential selections for action (gunners, damaged tiles, etc)
    stagedActors: [], // selected gunners, biodrones, satellites, etc.
    selectedModuleForMove: null,
    stagedModuleOptions: [],
    clickedCell: null,
    stageConfirmed: false,
    rollValue: 0,
    rollHistory: [],
    setupConfirmations: [
      false,
      false,
    ],
    players: [
      {
        arms: [],
        clones: [],
        biodrones: [],
        rbss: [],
      },
      {
        arms: [],
        clones: [],
        biodrones: [],
        rbss: [],
      },
    ],
  }),

  phases: {
    layout: {
      onBegin: (G) => {
        TileHelper.setOwnership(G);
      },
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
        clickCell,
        placeClone,
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
            moves: { rollDie },
            next: 'moveClone',
            start: true,
          },

          moveClone: {
            moves: { selectClone, selectCloneMoveTarget, selectModuleTargets },
            next: 'activateModule',
          },

          activateModule: {
            moves: { selectModuleTargets, confirmModuleTargetSelection },
            next: 'moveBiodrones',
          },

          moveBiodrones: {
            moves: { selectBiodrones, selectBiodroneMoveTarget, confirmBiodroneMoves },
            next: 'moveOrdnance',
          },

          moveOrdnance: {
            moves: { selectOrdnance, confirmOrdnanceSelection },
            next: 'fire',
          },

          fireArms: {
            moves: { selectArms, confirmArmsSelections },
          },

          repairShield: {
            moves: { repairShield, confirmShieldRepairs },
          },
        },
      },
    },
  },
};

export default Septikon;
