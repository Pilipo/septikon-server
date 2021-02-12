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

const ResourceHelper = {
    TYPE: TYPE,
    addResource: (G, ctx, type, count) => {
        console.log('adding ' + count);
        addResource(G, ctx, type);
    },
    getCurrentCapacity: (G, ctx, type) => {
        return getCurrentCapacity(G, ctx, type);
    },        
};

export default ResourceHelper;