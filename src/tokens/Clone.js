import Token from './Token';

class Clone extends Token {
    constructor(playerID, coordinates) {
        super(playerID, coordinates);
        this.spy = false;
        this.gunner = false;
    }
    move(targetCoordinates) {
        this.coordinates = this.coordinates;
    }
}

export default Clone;