class Token {
    constructor(playerID, coordinates, owner) {
        this.playerID = playerID;
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.owner = owner;
    }
}

export default Token;