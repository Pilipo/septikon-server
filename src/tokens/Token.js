import { TileHelper } from '../helpers/tileHelper';
class Token {
    constructor(playerID, coordinates) {
        this.playerID = playerID;
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.tileHelper = TileHelper;
    }

}

export default Token;