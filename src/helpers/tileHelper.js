const TileHelper = {
    tileIndexToCoordinates: (index) => {
        let x = (Math.floor(index / 21));
        let y = (index % 21);
        return {x, y};
    },
    tileCoordinatesToIndex: (coordinates) => {
        return coordinates.x * 21 + coordinates.y;
    },
};

export default TileHelper;