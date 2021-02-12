const TYPE = {
    energy1: 0,
    energy2: 1,
    metal: 2,
    biomass: 3,
    rocket: 4,
    uranium: 5,
    oxygen: 6,
    biodrone: 7,
};

const ResourceHelper = {
    TYPE: TYPE,
    addResource: (G, playerID, type) => {
        // TODO: check for legal resource space
    },
    spendResource: (G, playerID, type) => {
    },
};

export default ResourceHelper;