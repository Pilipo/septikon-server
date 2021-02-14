import PersonnelHelper from './personnelHelper';

const DevHelper = {
    stageForMoveClone: (G, ctx) => {
        [
            { x:0, y:0 },
            { x:0, y:1 },
            { x:0, y:2 },
            { x:0, y:3 },
            { x:0, y:4 },
        ].forEach(coordinate => {
            PersonnelHelper.placeClone(G, "0", coordinate);
        });
        [
            { x:30, y:0 },
            { x:30, y:1 },
            { x:30, y:2 },
            { x:30, y:3 },
            { x:30, y:4 },
        ].forEach(coordinate => {
            PersonnelHelper.placeClone(G, "1", coordinate);
        });
    },
};

export default DevHelper;