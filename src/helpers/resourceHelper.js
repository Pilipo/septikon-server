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

function loadWarehouseInOrder (G, ctx, type) {
    let warehouseArray = [];

    G.cells.forEach((cell, index) => {
        if (ctx.currentPlayer == 0 && index < 126) {
            if (type == cell.name) {
                if (index % 21 < 10) {
                    warehouseArray.unshift(cell);
                } else {
                    warehouseArray.push(cell);
                }
                
            }
        }
    });

    return warehouseArray;
};
function getCurrentSpendCapacity (G, ctx, type) {
    let warehouseArray = loadWarehouseInOrder(G, ctx, type);
    let spendCount = 0;
    let shouldSkip = false;

    warehouseArray.forEach((warehouseTile) => {
        if (shouldSkip) {
            return;
        }
        if (warehouseTile.damaged == true) {
            shouldSkip = true;
            return;
        }
        if (warehouseTile.isFull == true) {
            spendCount++;
        }
    });

    return spendCount;
}

function getCurrentCapacity (G, ctx, type) {
    let warehouseArray = loadWarehouseInOrder(G, ctx, type);
    let emptyCount = 0;
    let shouldSkip = false;

    warehouseArray.forEach((warehouseTile) => {
        if (shouldSkip) {
            return;
        }
        if (warehouseTile.damaged == true) {
            shouldSkip = true;
            return;
        }
        if (warehouseTile.isFull == false) {
            emptyCount++;
        }
    })
    return emptyCount;
};

function getLastFreeTileIndex (G, ctx, type) {
    let warehouseArray = loadWarehouseInOrder(G, ctx, type);
    let shouldSkip = false;
    let returnTile = null;

    warehouseArray.forEach((warehouseTile, index) => {
        if (shouldSkip) {
            return;
        }
        if (warehouseTile.damaged == true) {
            shouldSkip = true;
            returnTile = null;
            return;
        }
        if (warehouseTile.isFull == true) {
            shouldSkip = true;
            return;
        } else {
            returnTile = warehouseTile;
        }
    });
    return returnTile;
}

function getFirstFullTileIndex (G, ctx, type) {
    let warehouseArray = loadWarehouseInOrder(G, ctx, type);
    let shouldSkip = false;
    let returnTile = null;

    warehouseArray.forEach((warehouseTile, index) => {
        if (shouldSkip) {
            return;
        }
        if (warehouseTile.damaged == true) {
            shouldSkip = true;
            returnTile = null;
            return;
        }
        if (warehouseTile.isFull == true) {
            returnTile = warehouseTile;
            shouldSkip = true;
            return;
        } 
    });

    return returnTile;
}

function addResource (G, ctx, type) {
    let curCap = getCurrentCapacity(G, ctx, type);
    if (curCap <= 0) {
        return false;
    }
    let tile = getLastFreeTileIndex(G, ctx, type);
    if (tile == null) {
        return false;
    } else {
        G.cells[TileHelper.tileCoordinatesToIndex({ x: tile.x, y: tile.y })].isFull = true;
    }
}

function removeResource (G, ctx, type) {
    let tile = getFirstFullTileIndex(G, ctx, type);
    G.cells[TileHelper.tileCoordinatesToIndex({ x: tile.x, y: tile.y })].isFull = false;
}

const ResourceHelper = {
    TYPE: TYPE,
    addResource: (G, ctx, type, count) => {
        console.log('adding ' + count);
        for (let i = 0; i < count; i++) {
            addResource(G, ctx, type);
        }
    },
    removeResource: (G, ctx, type, count) => {
        let curCap = getCurrentSpendCapacity(G, ctx, type);
        if (curCap < count) {
            return false;
        }   
        for (let i = 0; i < count; i++) {
            removeResource(G, ctx, type);
        }
    },
    getCurrentCapacity: (G, ctx, type) => {
        return getCurrentCapacity(G, ctx, type);
    },        
};

export default ResourceHelper;