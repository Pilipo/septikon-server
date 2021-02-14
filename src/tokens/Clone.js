import Token from './Token';
import { TileHelper } from '../helpers/tileHelper';

class Clone {
    constructor(coordinates) {
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.tileHelper = TileHelper;
        this.spy = false;
        this.gunner = false;
    }
    move(G, ctx, targetCoordinates) {
        const originIndex = this.tileHelper.tileCoordinatesToIndex({ x: this.x, y: this.y });
        console.log('tile origin ' + originIndex);
        console.log(G.cells[originIndex].occupied);
        G.cells[originIndex].occupied = false;
        console.log(G.cells[originIndex].occupied);
        this.x = targetCoordinates.x;
        this.y = targetCoordinates.y;

        // G.players[ctx.currentPlayer]['clones'].forEach(currentClone => {
        //     if (currentClone.x == this.x && currentClone.y == this.y) {
        //         const previousIndex = this.tileHelper.tileCoordinatesToIndex({ x: this.x, y: this.y });
        //         const newIndex = this.tileHelper.tileCoordinatesToIndex(targetCoordinates);
        //         G.cells[previousIndex].occupied = false;
        //         G.cells[newIndex].occupied = true;
        //         this.x = targetCoordinates.x;
        //         this.y = targetCoordinates.y;
        //     }
        // });

        // G.players[playerID]['clones'].forEach((cloneHay, index) => {
        //     if (cloneNeedle.x == cloneHay.x && cloneNeedle.y == cloneHay.y) {
        //         // update tile occupation
        //         console.log('unsetting occupation');
        //         console.log({ x: cloneNeedle.x, y: cloneNeedle.y });
        //         console.log('setting occupation');
        //         console.log( { x: targetCoordinates.x, y: targetCoordinates.y });
        //         TileHelper.setValueForCoordinates(G, { x: cloneNeedle.x, y: cloneNeedle.y }, 'occupied', false);
        //         TileHelper.setValueForCoordinates(G, { x: targetCoordinates.x, y: targetCoordinates.y }, 'occupied', true);
        //         // update clone coordinates
        //         cloneNeedle.x = targetCoordinates.x;
        //         cloneNeedle.y = targetCoordinates.y;
        //         // update clone properties
        //         // console.log(TileHelper.getValueForCoordinates(G, { x: targetCoordinates.x, y: targetCoordinates.y }, 'type'));
        //         if (TileHelper.getValueForCoordinates(G, { x: targetCoordinates.x, y: targetCoordinates.y }, 'type') === 'surface') {
        //             cloneNeedle.gunner = true;
        //         }
        //     }
        // });
    }
}

export default Clone;