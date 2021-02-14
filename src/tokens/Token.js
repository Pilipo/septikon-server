import { TileHelper } from '../helpers/tileHelper';
class Token {
    constructor(coordinates) {
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.tileHelper = TileHelper;
    }

}

export default Token;