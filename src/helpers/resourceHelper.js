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

function loadWarehouseInOrder(G, ctx, type) {
  const warehouseArray = [];

  G.cells.forEach((cell, index) => {
    if (ctx.currentPlayer === 0 && index < 126) {
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
function getCurrentSpendCapacity(G, ctx, type) {
  const warehouseArray = loadWarehouseInOrder(G, ctx, type);
  let spendCount = 0;
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

function getCurrentCapacity(G, ctx, type) {
  const warehouseArray = loadWarehouseInOrder(G, ctx, type);
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

function getLastFreeTileIndex(G, ctx, type) {
  const warehouseArray = loadWarehouseInOrder(G, ctx, type);
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

function getFirstFullTileIndex(G, ctx, type) {
  const warehouseArray = loadWarehouseInOrder(G, ctx, type);
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

function addResource(G, ctx, type) {
  const curCap = getCurrentCapacity(G, ctx, type);
  if (curCap <= 0) {
    return false;
  }
  const tile = getLastFreeTileIndex(G, ctx, type);
  if (tile == null) {
    return false;
  }
  G.cells[TileHelper.tileCoordinatesToIndex({ x: tile.x, y: tile.y })].isFull = true;
  return true;
}

function removeResource(G, ctx, type) {
  const tile = getFirstFullTileIndex(G, ctx, type);
  G.cells[TileHelper.tileCoordinatesToIndex({ x: tile.x, y: tile.y })].isFull = false;
}

const ResourceHelper = {
  TYPE,
  addResource: (G, ctx, type, count) => {
    for (let i = 0; i < count; i += 1) {
      addResource(G, ctx, type);
    }
  },
  removeResource: (G, ctx, type, count) => {
    const curCap = getCurrentSpendCapacity(G, ctx, type);
    if (curCap < count) {
      return false;
    }
    for (let i = 0; i < count; i += 1) {
      removeResource(G, ctx, type);
    }
    return true;
  },
  getCurrentCapacity: (G, ctx, type) => getCurrentCapacity(G, ctx, type),
};

export default ResourceHelper;
