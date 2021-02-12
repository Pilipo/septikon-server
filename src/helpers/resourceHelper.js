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

const ResourceHelper = {
    TYPE: TYPE,
    addResource: (G, playerID, type) => {
        
    },
    getCurrentCapacity: (G, ctx, type) => {
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
        console.log(emptyCount);
    },
    spendResource: (G, playerID, type) => {
    },
};

export default ResourceHelper;