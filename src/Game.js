import PersonnelHelper from './helpers/personnelHelper';
import ResourceHelper from './helpers/resourceHelper';
import { TileHelper, tileProperties } from './helpers/tileHelper';
import WeaponHelper from './helpers/weaponHelper';

function clickCell(G, ctx, id) {
  G.clickedCell = G.cells[id];
}

function goToNextStage(G, ctx) {
  const currentStage = ctx.activePlayers[ctx.currentPlayer];
  const playerID = ctx.currentPlayer;
  const tile = G.selectedModuleForMove;
  switch (currentStage) {
    case 'moveClone':
      switch (tile.type) {
        case 'lock':
          break;
        case 'surface': {
          const tarCoords = { x: tile.x, y: tile.y };
          const tarClone = PersonnelHelper.getCloneByCoordinates(G, tarCoords);
          tarClone.gunner = true;
          break;
        }
        case 'armory':
          PersonnelHelper.armPlayerClones(G, playerID, tile.name);
          break;
        case 'production': {
          switch (tile.name) {
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
              const ct = tile.resourceCostType;
              const cc = tile.resourceCostCount;
              const yt = tile.resourceYieldType;
              const yc = tile.resourceYieldCount;
              ct.forEach((type, idx) => {
                ResourceHelper.removeResource(G, ctx, playerID, type, cc[idx]);
              });
              yt.forEach((type, idx) => {
                ResourceHelper.addResource(G, ctx, playerID, type, yc[idx]);
              });
              if (tile.name === 'nuclearArmory') {
                G.players[playerID].warheads += 1;
              }
              break;
            }
            default:
              break;
          }
          break;
        }
        case 'battle': {
          let hasReqs = false;
          switch (tile.name) {
            case 'thermite':
            case 'shield':
            case 'biodrone':
            case 'satellite':
            case 'laser':
            case 'rocket': {
              const gunners = PersonnelHelper.getGunners(G, ctx);
              const spendMultiple = ResourceHelper.getTileSpendMultiple(G, ctx, playerID, tile);
              if (gunners.length > 0 && spendMultiple) {
                hasReqs = true;
                G.stagedTargetOptions = gunners;
              }
              break;
            }
            case 'espionage':
            case 'takeover': {
              // TODO: check gunners' fire line for targets (clones or satellites)
              const gunners = PersonnelHelper.getGunners(G, ctx);
              const spendMultiple = ResourceHelper.getTileSpendMultiple(G, ctx, playerID, tile);
              let tarFound = null;
              if (gunners.length > 0 && spendMultiple) {
                if (tile.name === 'espionage') {
                  gunners.forEach((g) => {
                    if (tarFound) return;
                    tarFound = WeaponHelper.getEspionageTarget(G, ctx, g);
                  });
                } else {
                  gunners.forEach((g) => {
                    if (tarFound) return;
                    tarFound = WeaponHelper.getTakeoverTarget(G, ctx, g);
                  });
                }
                if (tarFound) {
                  hasReqs = true;
                  G.stagedTargetOptions = gunners;
                }
              }
              break;
            }
            case 'repairTwo':
              G.repairsLeft += 1;
            // falls through
            case 'repair': {
              G.repairsLeft += 1;
              const dT = TileHelper.getDamagedTilesByPlayerID(G, ctx, playerID);
              const spendMultiple = ResourceHelper.getTileSpendMultiple(G, ctx, playerID, tile);
              if (dT.length > 0 && spendMultiple) {
                hasReqs = true;
                G.stagedTargetOptions = dT;
              }
              break;
            }
            case 'counterEspionage': {
              const spies = PersonnelHelper.getPlayerSpies(G, playerID);
              const spendMultiple = ResourceHelper.getTileSpendMultiple(G, ctx, playerID, tile);
              if (spies.length > 0 && spendMultiple) {
                hasReqs = true;
                G.stagedTargetOptions = spies;
              }
              break;
            }
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
        // const tile = G.selectedModuleForMove;
        if (tile.targetType === 'gunner') {
          const targets = WeaponHelper.getGunnersTargets(G, ctx, G.stagedActors, tile);
          targets.forEach((tar) => {
            if (tar === null) throw new Error('no target found!');
            tile.resourceCostType.forEach((ct, idx) => {
              ResourceHelper.removeResource(G, ctx, playerID, ct, tile.resourceCostCount[idx]);
            });
            switch (tile.name) {
              case 'laser': {
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
              }
              case 'thermite':
                tar.damaged = true;
                break;
              case 'biodrone':
              case 'satellite':
              case 'rocket':
              case 'shield': {
                const obj = {
                  type: tile.name,
                  x: tar.x,
                  y: tar.y,
                  owner: playerID,
                  damaged: false,
                  hasMoved: true,
                  hasWarhead: false,
                };
                if (G.players[playerID].warheads) {
                  obj.hasWarhead = true;
                  G.players[playerID].warheads -= 1;
                }
                G.players[playerID].rbss.push(obj);
                // TODO: should this live elsewhere?
                tar.occupied = true;
                break;
              }
              case 'takeover': {
                G.stagedActors.forEach((gunner) => {
                  const tarClone = WeaponHelper.getTakeoverTarget(G, ctx, gunner);
                  tarClone.owner = playerID;
                });
                break;
              }
              case 'espionage': {
                G.stagedActors.forEach((gunner) => {
                  const tarClone = WeaponHelper.getEspionageTarget(G, ctx, gunner);
                  tarClone.spy = true;
                });
                break;
              }
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
      let ordFound = 0;
      G.players.forEach((player) => {
        player.rbss.forEach((ord) => {
          if (ord.type !== 'shield' && ord.hasMoved === false) {
            ordFound += 1;
          }
        });
      });
      // TODO: if ordFound === 1; just move the thing
      if (ordFound) {
        ctx.events.setStage('moveOrdnance');
        break;
      }
    }
    // falls through
    case 'moveOrdnance': {
      const curP = ctx.currentPlayer;
      const oppP = ctx.currentPlayer === 0 ? 1 : 0;
      const sats = WeaponHelper.getSatellites(G);
      let cTars = [];
      let oTars = [];

      sats.forEach((sat) => {
        cTars = cTars.concat(WeaponHelper.getSatelliteTargets(G, curP, sat));
        oTars = oTars.concat(WeaponHelper.getSatelliteTargets(G, oppP, sat));
      });
      G.players[curP].clones.forEach((clone) => {
        if (!clone.spy) cTars = cTars.concat(WeaponHelper.getArmsTargets(G, curP, clone));
      });
      G.players[oppP].clones.forEach((clone) => {
        if (clone.spy) cTars = cTars.concat(WeaponHelper.getArmsTargets(G, oppP, clone));
      });
      cTars.forEach((tar) => {
        // kill em all
        if (tar.type === 'biodrone') {
          PersonnelHelper.removeBiodrone(G, oppP, { x: tar.x, y: tar.y });
        } else if (tar.type === 'rocket') {
          WeaponHelper.removeOrdnance(G, ctx, tar);
        } else {
          PersonnelHelper.removeClone(G, oppP, { x: tar.x, y: tar.y });
        }
      });

      G.players[oppP].clones.forEach((clone) => {
        if (!clone.spy) oTars = oTars.concat(WeaponHelper.getArmsTargets(G, oppP, clone));
      });
      G.players[curP].clones.forEach((clone) => {
        if (clone.spy) oTars = oTars.concat(WeaponHelper.getArmsTargets(G, curP, clone));
      });
      oTars.forEach((tar) => {
        // kill em all
        if (tar.type === 'biodrone') {
          PersonnelHelper.removeBiodrone(G, curP, { x: tar.x, y: tar.y });
        } else if (tar.type === 'rocket') {
          WeaponHelper.removeOrdnance(G, ctx, tar);
        } else {
          PersonnelHelper.removeClone(G, curP, { x: tar.x, y: tar.y });
        }
      });
    }
    // falls through
    default:
      // cleanup
      G.selectedModuleForMove = null;
      G.stagedModuleOptions = [];
      G.stagedActors = [];
      G.repairsLeft = 0;
      WeaponHelper.resetMoves(G, ctx);
      ctx.events.endTurn();
      break;
  }
}

// PHASE: layout
function placeClone(G, ctx, id, playerID) {
  const coords = TileHelper.indexToCoordinates(id);
  const cloneIndex = PersonnelHelper.getCloneIndexByCoordinates(G, coords);
  if (cloneIndex === false) {
    PersonnelHelper.placeClone(G, playerID, coords);
  } else {
    PersonnelHelper.removeClone(G, playerID, coords);
  }
}

function confirmSetup(G, ctx, playerID) {
  const { clones } = G.players[playerID];
  if (clones.length === 5) {
    const arms = [];
    clones.forEach((clone) => {
      const cc = { x: clone.x, y: clone.y };
      const tile = TileHelper.getClickedTileByCoordinates(G, cc);
      if (tile.type === 'armory') {
        arms.push({ type: tile.name });
      }
    });
    if (arms.length) arms.forEach((arm) => PersonnelHelper.armPlayerClones(G, playerID, arm.type));
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
  const cc = TileHelper.indexToCoordinates(id);
  const c = PersonnelHelper.getCloneByCoordinates(G, cc);
  if ((c.owner === playerID && !c.spy) || (c.owner !== playerID && c.spy)) {
    G.stagedActors.push(c);
    G.stagedModuleOptions = PersonnelHelper.getClonesLegalMoves(G, playerID, G.rollValue, cc);
  }
}

function selectCloneMoveTarget(G, ctx, id) {
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
    PersonnelHelper.moveClone(G, { x: stagedClone.x, y: stagedClone.y }, coords);
    G.stagedModuleOptions = [];
    G.selectedModuleForMove = G.clickedCell;
    // advance turn stage
    goToNextStage(G, ctx);
  }
}

// STAGE: activateModule
function selectModuleTargets(G, ctx, id, playerID) {
  const coords = TileHelper.indexToCoordinates(id);
  const tile = G.selectedModuleForMove;
  if (tile.targetType === 'gunner') {
    const gunner = PersonnelHelper.getCloneByCoordinates(G, coords);
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
  } else if (tile.targetType === 'damage') {
    if (G.repairsLeft) {
      const dt = TileHelper.getClickedTileByIndex(G, id);
      const canAfford = ResourceHelper.getTileSpendMultiple(G, ctx, playerID, dt);
      if (canAfford) {
        dt.damaged = false;
        G.repairsLeft -= 1;
        const ct = tile.resourceCostType;
        const cc = tile.resourceCostCount;
        ct.forEach((type, idx) => {
          ResourceHelper.removeResource(G, ctx, playerID, type, cc[idx]);
        });
        if (!G.repairsLeft) goToNextStage(G, ctx);
      }
    }
  } else if (tile.targetType === 'spy') {
    const sc = TileHelper.indexToCoordinates(id);
    const spy = PersonnelHelper.getCloneByCoordinates(G, sc);
    const canAfford = ResourceHelper.getTileSpendMultiple(G, ctx, playerID, tile);
    if (canAfford) {
      spy.spy = false;
      const ct = tile.resourceCostType;
      const cc = tile.resourceCostCount;
      ct.forEach((type, idx) => {
        ResourceHelper.removeResource(G, ctx, playerID, type, cc[idx]);
      });
      goToNextStage(G, ctx);
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
  // TODO: Kill if possible; end turn if not
}

// TODO: confirmArmsSelections
function confirmArmsSelections() {
  // TODO: Check for remaining killings
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
    repairsLeft: 0,
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
        rbss: [],
        warheads: 0,
      },
      {
        clones: [],
        biodrones: [],
        rbss: [],
        warheads: 0,
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
