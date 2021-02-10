const tilesJSON = require('../constants/tile_map.json');

function indexToCoordinates(index) {
    let x = (Math.floor(index / 21));
    let y = (index % 21);
    return { x, y };
}

function coordinatesToIndex(coordinates) {
    return coordinates.x * 21 + coordinates.y;
}

const tileProperties = {
    occupied: false,
    damaged: false,
    owner: null,
}

const directions = {
    NORTH: 1,
    EAST: 2,
    SOUTH: 4,
    WEST: 8,
}

const TileHelper = {
    tileIndexToCoordinates: (index) => {
        return indexToCoordinates(index);
    },
    tileCoordinatesToIndex: (coordinates) => {
        return coordinatesToIndex(coordinates);
    },
    getClickedTileByIndex: (index) => {
        let coordinates = indexToCoordinates(index);
        return tilesJSON[coordinates.x][coordinates.y];
    },
    getClickedTileByCoordinates: (coordinates) => {
        return tilesJSON[coordinates.x][coordinates.y];
    },
    setValueForCoordinates: (G, coordinates, key, value) => {
        let index = coordinatesToIndex(coordinates);
        G.cells[index][key] = value;
    },
    getLocks: (playerID) => {
        const returnArray = [];
        for (let i = 0; i < 651; i++) {
            let coordinates = indexToCoordinates(i);
            let tile = tilesJSON[coordinates.x][coordinates.y];
            if (tile.name === "lock" && tile.owner === playerID) {
                returnArray.push(tile);
            }
        }
        return returnArray;
    },
    setOwnership: (G) => {
        G.cells.map((cell, index) => {
            if (index < 160) {
                cell['owner'] = 0;
            }
            if (index > 460) {
                cell['owner'] = 1;
            }
        });
    },
    getCoordinateByDirection(originCoordinate, direction) {
        const dirChange = { NORTH: { x: 0, y: -1 }, EAST: { x: 1, y: 0 }, SOUTH: { x: 0, y: 1 }, WEST: { x: -1, y: 0 } };

        const potentialResult = { x: (parseInt(originCoordinate.x) + parseInt(dirChange[direction].x)), y: (parseInt(originCoordinate.y) + parseInt(dirChange[direction].y)) };
        if (potentialResult.x < 0 || potentialResult.x > 30 | potentialResult.y < 0 | potentialResult.y > 20) {
            return false;
        } else {
            return potentialResult;
        }
    },
};

export { TileHelper, tileProperties, directions };
