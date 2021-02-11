import PersonnelHelper from './personnelHelper';

const DevHelper = {
    stageForMoveClone: (G, ctx) => {
        [
            { x:0, y:0 },
            { x:1, y:5 },
            { x:7, y:0 },
            { x:7, y:12 },
            { x:0, y:20 },
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