import { TileHelper } from './tileHelper';

function getLaserTarget(G, ctx, gunner) {
  let target = null;
  const it = ctx.currentPlayer === '0' ? 1 : -1;
  for (let x = gunner.x + it; x < TileHelper.upperX; x += it) {
    if (target) break;
    const tile = TileHelper.getClickedTileByCoordinates(G, { x, y: gunner.y });
    if (tile.name === 'space' && tile.occupied === true) {
      target = tile;
    }
    if (tile.name === 'surface' && tile.occupied === true) {
      target = tile;
    }
    if (tile.name !== 'space' && tile.name !== 'surface' && tile.damaged === false) {
      target = tile;
    }
  }
  return target;
}

function getThermiteTarget(G, ctx, gunner) {
  let target = null;
  const x = ctx.currentPlayer === '0' ? 31 - G.rollValue : 0 + G.rollValue - 1;
  const tile = TileHelper.getClickedTileByCoordinates(G, { x, y: gunner.y });
  if (tile.damaged === false) target = tile;
  return target;
}

function getRBSTarget(G, ctx, gunner) {
  // gets target for Rocket, Biodrone, Shield, or Satellite
  let target = null;
  const x = ctx.currentPlayer === '0' ? gunner.x + G.rollValue : gunner.x - G.rollValue;
  const it = ctx.currentPlayer === '0' ? 1 : -1;
  let tile = TileHelper.getClickedTileByCoordinates(G, { x, y: gunner.y });
  let i = 0;
  while (tile.damaged === true) {
    i += 1;
    tile = TileHelper.getClickedTileByCoordinates(G, { x: (x + it * i), y: gunner.y });
    target = tile;
  }

  return target;
}

function getEspionageTarget(G, ctx, gunner) {
  const oppID = ctx.currentPlayer === '0' ? '1' : '0';
  const oppClones = G.players[oppID].clones;
  const targets = [];
  let target = null;
  oppClones.forEach((clone) => {
    if (clone.y === gunner.y) {
      targets.push(clone);
    }
  });
  if (!targets.length) return target;

  // eslint-disable-next-line prefer-destructuring
  target = targets[0];
  targets.forEach((t) => {
    if (gunner.x < 10 && t.x < target.x) {
      target = t;
    }
    if (gunner.x > 10 && t.x > target.x) {
      target = t;
    }
  });
  return target;
}

function getTakeoverTarget(G, ctx, gunner) {
  const oppID = ctx.currentPlayer === '0' ? '1' : '0';
  const oppSats = G.players[oppID].satellites;
  const targets = [];
  let target = null;
  oppSats.forEach((sat) => {
    if (sat.y === gunner.y) {
      targets.push(sat);
    }
  });
  if (!targets.length) return target;

  // eslint-disable-next-line prefer-destructuring
  target = targets[0];
  targets.forEach((t) => {
    if (gunner.x < 10 && t.x < target.x) {
      target = t;
    }
    if (gunner.x > 10 && t.x > target.x) {
      target = t;
    }
  });
  return target;
}

const WeaponHelper = {
  getGunnersTargets: (G, ctx, gunners, battleTile) => {
    const returnTargets = [];
    if (gunners.length === 0) return returnTargets;

    gunners.forEach((gunner) => {
      switch (battleTile.name) {
        case 'laser':
          returnTargets.push(getLaserTarget(G, ctx, gunner));
          break;
        case 'thermite':
          returnTargets.push(getThermiteTarget(G, ctx, gunner));
          break;
        case 'rocket':
          returnTargets.push(getRBSTarget(G, ctx, gunner));
          break;
        case 'biodrone':
          returnTargets.push(getRBSTarget(G, ctx, gunner));
          break;
        case 'shield':
          returnTargets.push(getRBSTarget(G, ctx, gunner));
          break;
        case 'satellite':
          returnTargets.push(getRBSTarget(G, ctx, gunner));
          break;
        case 'espionage':
          returnTargets.push(getEspionageTarget(G, ctx, gunner));
          break;
        case 'takeover':
          returnTargets.push(getTakeoverTarget(G, ctx, gunner));
          break;
        default:
          break;
      }
    });
    return returnTargets;
  },
};

export default WeaponHelper;
