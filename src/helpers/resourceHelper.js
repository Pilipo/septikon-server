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

function getCurrentCapacity (G, ctx, type) {
    let warehouseArray = [];
    let emptyCount = 0;
    let shouldSkip = false;

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

function getfirstFreeTileIndex (G, ctx, type) {
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
    warehouseArray.forEach((warehouseTile, index) => {
        if (warehouseTile.damaged == true || warehouseTile.isFull == true) {
            
            return (index - 1);
        }
    })
}

function addResource (G, ctx, type) {
    let curCap = getCurrentCapacity(G, ctx, type);
    if (curCap <= 0) {
        console.log('no can do, partner.');
        return false;
    }
    console.log('in we go');
    console.log(getfirstFreeTileIndex(G, ctx, type));
}

const ResourceHelper = {
    TYPE: TYPE,
    addResource: (G, ctx, type, count) => {
        console.log('adding ' + count);
        for (let i = 0; i < count; i++) {
            addResource(G, ctx, type);
        }
    },
    getCurrentCapacity: (G, ctx, type) => {
        return getCurrentCapacity(G, ctx, type);
    },        
};

export default ResourceHelper;