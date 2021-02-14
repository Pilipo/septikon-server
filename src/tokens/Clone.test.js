const { TestScheduler } = require("jest");
const { default: Clone } = require("./Clone");
const getCloneObject = require("./Clone");
TestScheduler("Returns a Clone object", () => {
    expect(new Clone({ x: 30, y: 20 })).toMatchObject({
        x: 30,
        y: 20,
        gunner: false,
        spy: true,
    });
});