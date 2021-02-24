import { TileHelper } from './tileHelper';

const TYPE = {
  energy1: 0,
  energy2: 1,
  metal: 2,
  biomass: 3,
  rocket: 4,
  uranium: 5,
  oxygen: 6,
  biodrone: 7,
};

function getOrderedWarehouse(G, ctx, playerID, type) {
  const warehouseArray = [];

  G.cells.forEach((cell, index) => {
    if (playerID === cell.owner && (index < 126 || index > 524)) {
      if (type === cell.name) {
        if (index % 21 < 10) {
          warehouseArray.unshift(cell);
        } else {
          warehouseArray.push(cell);
        }
      }
    }
  });

  return warehouseArray;
}
function getSpendCapacity(G, ctx, playerID, type) {
  if (Number.isNaN(parseInt(playerID, 10))) throw new Error('PlayerID is not a number!');
  let spendCount = 0;

  if (type === 'energy') {
    spendCount += getSpendCapacity(G, ctx, playerID, 'energy1');
    spendCount += getSpendCapacity(G, ctx, playerID, 'energy2');
    return spendCount;
  }

  const warehouseArray = getOrderedWarehouse(G, ctx, playerID, type);
  let shouldSkip = false;

  warehouseArray.forEach((warehouseTile) => {
    if (shouldSkip) {
      return;
    }
    if (warehouseTile.damaged === true) {
      shouldSkip = true;
      return;
    }
    if (warehouseTile.isFull === true) {
      spendCount += 1;
    }
  });

  return spendCount;
}

function getCapacity(G, ctx, playerID, type) {
  const warehouseArray = getOrderedWarehouse(G, ctx, playerID, type);
  let emptyCount = 0;
  let shouldSkip = false;

  warehouseArray.forEach((warehouseTile) => {
    if (shouldSkip) {
      return;
    }
    if (warehouseTile.damaged === true) {
      shouldSkip = true;
      return;
    }
    if (warehouseTile.isFull === false) {
      emptyCount += 1;
    }
  });
  return emptyCount;
}

function getLastFreeTileIndex(G, ctx, playerID, type) {
  const warehouseArray = getOrderedWarehouse(G, ctx, playerID, type);
  let shouldSkip = false;
  let returnTile = null;

  warehouseArray.forEach((warehouseTile) => {
    if (shouldSkip) {
      return;
    }
    if (warehouseTile.damaged === true) {
      shouldSkip = true;
      returnTile = null;
      return;
    }
    if (warehouseTile.isFull === true) {
      shouldSkip = true;
    } else {
      returnTile = warehouseTile;
    }
  });
  return returnTile;
}

function getFirstFullTileIndex(G, ctx, playerID, type) {
  const warehouseArray = getOrderedWarehouse(G, ctx, playerID, type);
  let shouldSkip = false;
  let returnTile = null;

  warehouseArray.forEach((warehouseTile) => {
    if (shouldSkip) {
      return;
    }
    if (warehouseTile.damaged === true) {
      shouldSkip = true;
      returnTile = null;
      return;
    }
    if (warehouseTile.isFull === true) {
      returnTile = warehouseTile;
      shouldSkip = true;
    }
  });

  return returnTile;
}

function addResource(G, ctx, playerID, type) {
  const curCap = getCapacity(G, ctx, playerID, type);

  if (curCap <= 0) {
    return false;
  }
  const tile = getLastFreeTileIndex(G, ctx, playerID, type);
  if (tile == null) {
    return false;
  }
  G.cells[TileHelper.coordinatesToIndex({ x: tile.x, y: tile.y })].isFull = true;
  return true;
}

function removeResource(G, ctx, playerID, type) {
  const tile = getFirstFullTileIndex(G, ctx, playerID, type);
  G.cells[TileHelper.coordinatesToIndex({ x: tile.x, y: tile.y })].isFull = false;
}

const ResourceHelper = {
  TYPE,
  addResource: (G, ctx, playerID, type, count) => {
    for (let i = 0; i < count; i += 1) {
      addResource(G, ctx, playerID, type);
    }
  },
  removeResource: (G, ctx, playerID, type, count) => {
    let curCap = null;
    let convertedType = null;
    if (type === 'energy') {
      const curCapE1 = getSpendCapacity(G, ctx, playerID, 'energy1');
      const curCapE2 = getSpendCapacity(G, ctx, playerID, 'energy2');
      curCap = curCapE1 > curCapE2 ? curCapE1 : curCapE2;
      convertedType = curCapE2 > curCapE1 ? 'energy2' : 'energy1';
    } else {
      curCap = getSpendCapacity(G, ctx, playerID, type);
      convertedType = type;
    }

    if (curCap < count) {
      return false;
    }
    for (let i = 0; i < count; i += 1) {
      removeResource(G, ctx, playerID, convertedType);
    }
    return true;
  },
  getCapacity: (G, ctx, type) => getCapacity(G, ctx, type),
  getSpendCapacity,
};

export default ResourceHelper;
