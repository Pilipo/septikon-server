import Clone from '../tokens/Clone';
import { TileHelper } from './tileHelper';

const PersonnelHelper = {
    getCloneIndexByCoordinates: (G, playerID, coordinates) => {
        let cloneIndex = false;
        if (G.players[playerID]['clones'].length > 0) {
            G.players[playerID]['clones'].forEach((element, index) => {
                if (element.x == coordinates.x && element.y == coordinates.y) {
                    cloneIndex = index;
                } 
            });
        }
        return cloneIndex;
    },
    placeClone: (G, playerID, coordinates) => {
        if (G.players[playerID]['clones'].length < 5) {
            let tile = TileHelper.getClickedTileByCoordinates(coordinates);
            if (tile.owner === playerID && tile.name !== "surface") {
                let newClone = {
                    type: "clone",
                    x: coordinates.x,
                    y: coordinates.y,
                };
                G.players[playerID]['clones'].push(newClone);
                TileHelper.setValueForCoordinates(G, coordinates, 'occupied', true);
            }
        }
    },
    removeClone: (G, playerID, coordinates) => {
        if (G.players[playerID]['clones'].length > 0) {
            G.players[playerID]['clones'].forEach((element, index) => {
                if (element.x == coordinates.x && element.y == coordinates.y) {
                    G.players[playerID]['clones'].splice(index, 1);
                    TileHelper.setValueForCoordinates(G, coordinates, 'occupied', false);
                } 
            });
        }
    }
};

export default PersonnelHelper;