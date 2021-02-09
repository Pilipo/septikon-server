const tilesJSON = require('../constants/tile_map.json');

function indexToCoordinates(index) {
    let x = (Math.floor(index / 21));
    let y = (index % 21);
    return {x, y};
}

function coordinatesToIndex(coordinates) {
    return coordinates.x * 21 + coordinates.y;
}

const tileProperties = {
    occupied: false,
    damaged: false,
    owner: null,
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
};

export { TileHelper, tileProperties };
