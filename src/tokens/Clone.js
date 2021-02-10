import Token from './Token';

class Clone extends Token {
    constructor(playerID, coordinates) {
        super(playerID, coordinates);
        this.spy = false;
    }
}

export default Clone;