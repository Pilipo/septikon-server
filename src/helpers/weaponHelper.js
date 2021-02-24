import PersonnelHelper from './personnelHelper';
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

function getDamagedShields(G, ctx, playerID) {
  if (typeof playerID === 'undefined') throw new Error('playerID undefined!');
  const damagedShields = [];
  G.players[playerID].rbss.forEach((shield) => {
    if (shield.type !== 'shield') return;
    if (shield.damaged === true) damagedShields.push(shield);
  });

  return damagedShields;
}

function getUnmovedOrdnance(G, ctx) {
  const returnOrds = [];
  G.players.forEach((player) => {
    player.rbss.forEach((ord) => {
      if (ord.hasMoved === false) {
        returnOrds.push(ord);
      }
    });
  });
  return returnOrds;
}

function removeOrdnance(G, ctx, ord) {
  if (typeof ord === 'undefined') throw new Error('ord is undefined!');
  let found = false;
  G.players.forEach((player) => {
    if (found) return;
    player.rbss.forEach((testOrd, idx) => {
      if (found) return;
      const toc = { x: testOrd.x, y: testOrd.y };
      const oc = { x: ord.x, y: ord.y };
      if (JSON.stringify(toc) === JSON.stringify(oc)) {
        player.rbss.splice(idx, 1);
        found = true;
      }
    });
  });
}

function moveOrdnance(G, ctx, ord) {
  if (typeof ord === 'undefined') throw new Error('ord is undefined!');

  const newX = ord.owner === '0' ? (ord.x + G.rollValue) : (ord.x - G.rollValue);
  const coord = { x: newX, y: ord.y };
  const tarTile = TileHelper.getClickedTileByCoordinates(G, coord);
  // is non-space, non-surface tile undamaged? (rocket dies and damages tile)
  // biodrones can land on damage
  if (tarTile.occupied === true) {
    const occupant = TileHelper.getOccupantByTileID(G, ctx, coord);
    if (occupant.owner !== ord.owner && (ord.type === 'rocket' || ord.type === 'biodrone')) {
      // TODO: kill occupant and ord (no tile damage)
    }
  } else if (tarTile.type !== 'space' && tarTile.type !== 'surface') {
    if (ord.type === 'rocket') {
      tarTile.damaged = true;
      removeOrdnance(G, ctx, ord);
    }
    if (ord.type === 'biodrone') {
      G.players[ord.owner].biodrones.push({
        x: tarTile.x,
        y: tarTile.y,
      });
      tarTile.occupied = true;
      removeOrdnance(G, ctx, ord);
    }
  }

  ord.x = newX;
  ord.hasMoved = true;
}

function getRBSSByTileIndex(G, ctx, tileID) {
  if (typeof tileID === 'undefined') throw new Error('tileID is undefined!');
  let RBSS = null;
  const coord = TileHelper.indexToCoordinates(tileID);

  G.players.forEach((player) => {
    if (RBSS) return;
    player.rbss.forEach((rbss) => {
      if (RBSS) return;
      if (rbss.x === coord.x && rbss.y === coord.y) {
        RBSS = rbss;
      }
    });
  });
  return RBSS;
}

function getRBSSTarget(G, ctx, gunner) {
  // gets target for Rocket, Biodrone, Shield, or Satellite
  let target = null;
  const x = ctx.currentPlayer === '0' ? gunner.x + G.rollValue : gunner.x - G.rollValue;
  const it = ctx.currentPlayer === '0' ? 1 : -1;
  let tile = TileHelper.getClickedTileByCoordinates(G, { x, y: gunner.y });
  let i = 0;
  do {
    tile = TileHelper.getClickedTileByCoordinates(G, { x: (x + it * i), y: gunner.y });
    target = tile;
    i += 1;
  } while (tile.damaged === true);

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

function resetMoves(G, ctx) {
  G.players.forEach((player) => {
    player.rbss.forEach((ord) => {
      if (ord.type === 'rocket' || ord.type === 'biodrone') {
        ord.hasMoved = false;
      }
    });
  });
}

const WeaponHelper = {
  getRBSSByTileIndex,
  getDamagedShields,
  getUnmovedOrdnance,
  moveOrdnance,
  resetMoves,
  removeOrdnance,
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
          returnTargets.push(getRBSSTarget(G, ctx, gunner));
          break;
        case 'biodrone':
          returnTargets.push(getRBSSTarget(G, ctx, gunner));
          break;
        case 'shield':
          returnTargets.push(getRBSSTarget(G, ctx, gunner));
          break;
        case 'satellite':
          returnTargets.push(getRBSSTarget(G, ctx, gunner));
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
