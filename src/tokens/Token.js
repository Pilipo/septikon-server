class Token {
    constructor(playerID, coordinates) {
        this.playerID = playerID;
        this.x = coordinates.x;
        this.y = coordinates.y;
    }
}

export default Token;